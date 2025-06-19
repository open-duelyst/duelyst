const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');
const ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('bloodstorm', () => {
  describe('faction6', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction6.AltGeneral },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    /* Test disabled: failing
    it('expect myriad to summon a random wall nearby whenever you use your BBS', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      var myriad = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.Myriad}, 4, 3, gameSession.getPlayer1Id());

      var action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      var wall = board.getFriendlyEntitiesAroundEntity(myriad);
      var wallCheck = false;

      if(wall[0].getId() === SDK.Cards.Faction6.GravityWell){
        wallCheck = true;
      } else if(wall[0].getId() === SDK.Cards.Faction6.BlazingSpines){
        wallCheck = true;
      } else if(wall[0].getId() === SDK.Cards.Faction6.BonechillBarrier){
        wallCheck = true;
      }

      expect(wallCheck).to.equal(true);
    });
    */

    it('expect frigid corona to stun an enemy and draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrinityOath }));

      const myriad = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Myriad }, 4, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FrigidCorona }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 4, 3));

      expect(myriad.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getId()).to.equal(SDK.Cards.Spell.TrinityOath);
      expect(hand[1]).to.not.exist;
    });

    it('expect sleet dasher to reactivate whenever it destroys a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const sleetDasher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.SleetDasher }, 0, 1, gameSession.getPlayer1Id());
      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer2Id());
      const valeHunter2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer2Id());
      const valeHunter3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());
      const windstopper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WindStopper }, 1, 0, gameSession.getPlayer2Id());

      sleetDasher.refreshExhaustion();
      var action = sleetDasher.actionAttack(valeHunter);
      gameSession.executeAction(action);
      var action = sleetDasher.actionAttack(valeHunter2);
      gameSession.executeAction(action);
      var action = sleetDasher.actionAttack(windstopper);
      gameSession.executeAction(action);
      var action = sleetDasher.actionAttack(valeHunter3);
      gameSession.executeAction(action);

      expect(valeHunter.getIsRemoved()).to.equal(true);
      expect(valeHunter2.getIsRemoved()).to.equal(true);
      expect(windstopper.getIsRemoved()).to.equal(false);
      expect(valeHunter3.getIsRemoved()).to.equal(false);
    });

    it('expect concealing shroud to make your general immune to damage until your next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ConcealingShroud }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 3, 1));

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 3, 1));

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
    });

    it('expect enfeeble to turn all minions into 1/1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const juggernaut = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalJuggernaut }, 1, 1, gameSession.getPlayer2Id());
      const adept = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WindbladeAdept }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GreaterFortitude }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enfeeble }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 1));

      expect(juggernaut.getHP()).to.equal(1);
      expect(adept.getHP()).to.equal(1);
      expect(juggernaut.getATK()).to.equal(1);
      expect(adept.getATK()).to.equal(2);
    });

    /* Test disabled: failing
    it('expect grandmaster embla to surround the enemy general with walls', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction6.GrandmasterEmbla}));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      var wall = board.getEnemyEntitiesAroundEntity(gameSession.getGeneralForPlayer2());
      var wallCheck = false;
      var wallFailure = false;

      for(var i = 0; i < wall.length; i++){
        if(wall[i].getId() === SDK.Cards.Faction6.GravityWell){
          wallCheck = true;
        } else if(wall[i].getId() === SDK.Cards.Faction6.BlazingSpines){
          wallCheck = true;
        } else if(wall[i].getId() === SDK.Cards.Faction6.BonechillBarrier){
          wallCheck = true;
        } else {
          wallFailure = true;
        }
      }

      expect(wallCheck).to.equal(true);
      expect(wallFailure).to.equal(false);
    });
    */
  });
});
