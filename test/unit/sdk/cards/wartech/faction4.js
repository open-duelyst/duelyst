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
const ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('wartech', () => {
  describe('faction4', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction4.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect cacophynos to destroy a random nearby enemy when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const cacophynos = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Cacophynos }, 1, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const action = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(action);

      expect(silverguardSquire.getIsRemoved()).to.equal(true);
      expect(cacophynos.getIsRemoved()).to.equal(true);
    });

    it('expect void talon to successfully build', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.VoidTalon }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const voidTalon = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(voidTalon.getATK()).to.equal(6);
    });

    /* Test disabled: failing
    it('expect horrific visage to lower enemy minions attack by 3 temporarily', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      var cacophynos = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Cacophynos}, 1, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.HorrificVisage}));
      var action = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(action);

      expect(cacophynos.getATK()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(cacophynos.getATK()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(cacophynos.getATK()).to.equal(6);

    });
    */

    it('expect vellumscry to destroy a friendly minion to draw 3 cards', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Vellumscry }));
      const action = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[2].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect nightmare operant to put a MECHAZ0R in your deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const nightmareOperant = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.NightmareOperant }, 1, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var action = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PhaseHound }));
      var action = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });

    it('expect deathmark to deal 1 damage to a minion, and for the minion to be destroyed when attacked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const imperviousGiago = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ImperviousGiago }, 7, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Deathmark }));
      var action = player2.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(action);

      expect(imperviousGiago.getHP()).to.equal(9);

      var action = gameSession.getGeneralForPlayer2().actionAttack(imperviousGiago);
      gameSession.executeAction(action);

      expect(imperviousGiago.getIsRemoved()).to.equal(true);
    });

    it('expect furor chakram to give friendly minions +2 Attack and Frenzy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.FurorChakram }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 0, 1, gameSession.getPlayer1Id());

      expect(silverguardSquire.hasActiveModifierClass(SDK.ModifierFrenzy)).to.equal(true);
      expect(silverguardSquire.getATK()).to.equal(3);
    });

    it('expect moonrider to summon a Fiend nearby when you use your BBS', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const moonrider = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Moonrider }, 4, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(4, 3);
      gameSession.executeAction(action);

      const fiend = board.getEntitiesAroundEntity(moonrider);
      expect(fiend.length).to.equal(1);
      expect(fiend[0].getId()).to.equal(SDK.Cards.Faction4.Fiend);
    });

    it('expect betrayal to cause enemy minions near the enemy general to attack them', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const cacophynos = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Cacophynos }, 8, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Betrayal }));
      const action = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(action);

      expect(cacophynos.getHP()).to.equal(1);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(19);
    });

    it('expect abhorrent unbirth to destroy all your minions and  create a 1/1 abomination that gains all their Attack, Health, and keywords', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const keyword1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 5, 2, gameSession.getPlayer1Id());
      const keyword2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SpottedDragonlark }, 6, 3, gameSession.getPlayer1Id());
      const keyword3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.MakantorWarbeast }, 8, 3, gameSession.getPlayer1Id());
      const keyword4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SapphireSeer }, 3, 1, gameSession.getPlayer1Id());
      const keyword5 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RockPulverizer }, 4, 1, gameSession.getPlayer1Id());
      const keyword6 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.LysianBrawler }, 4, 3, gameSession.getPlayer1Id());
      const keyword7 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 4, 4, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AbhorrentUnbirth }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(keyword1.getIsRemoved()).to.equal(true);
      expect(keyword2.getIsRemoved()).to.equal(true);
      expect(keyword3.getIsRemoved()).to.equal(true);
      expect(keyword4.getIsRemoved()).to.equal(true);
      expect(keyword5.getIsRemoved()).to.equal(true);
      expect(keyword6.getIsRemoved()).to.equal(true);
      expect(keyword7.getIsRemoved()).to.equal(true);

      const abomination = board.getUnitAtPosition({ x: 1, y: 2 });
      expect(abomination.getATK()).to.equal(17);
      expect(abomination.getHP()).to.equal(19);

      expect(abomination.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
      expect(abomination.hasModifierClass(SDK.ModifierBlastAttack)).to.equal(true);
      expect(abomination.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
      expect(abomination.hasModifierClass(ModifierForcefield)).to.equal(true);
      expect(abomination.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(abomination.hasModifierClass(ModifierTranscendance)).to.equal(true);
      expect(abomination.hasModifierClass(SDK.ModifierRanged)).to.equal(true);

      const action = abomination.actionMove({ x: 1, y: 4 });
      gameSession.executeAction(action);
      expect(abomination.getPosition().x).to.equal(1);
      expect(abomination.getPosition().y).to.equal(4);
    });

    /* Test disabled: inconsistent
    it('expect gate to the undervault to summon a random demon when a minion is destroyed', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.GateToUndervault}));
      var action = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 4, 4, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var action = player1.actionPlayCardFromHand(0, 4, 4);
      gameSession.executeAction(action);

      var gateToTheUndervault = board.getUnitAtPosition({x:1,y:2}, true);
      var demons = board.getFriendlyEntitiesAroundEntity(gateToTheUndervault);
      var areThereDemons = false;

      if(demons[0].getId() === SDK.Cards.Faction4.Klaxon){
        areThereDemons = true;
      } else if(demons[0].getId() === SDK.Cards.Faction4.VorpalReaver){
        areThereDemons = true;
      } else if(demons[0].getId() === SDK.Cards.Faction4.Moonrider){
        areThereDemons = true;
      }

      expect(areThereDemons).to.equal(true);

    });
    */

    it('expect gate to the undervault to be invulnerable', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GateToUndervault }));
      var action = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.DarkTransformation }));
      var action = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(action);

      const gateToTheUndervault = board.getUnitAtPosition({ x: 1, y: 2 }, true);
      expect(gateToTheUndervault.getIsRemoved()).to.equal(false);
    });

    it('expect stygian observer to give friendly minions in your action bar +2/+2 whenever a minion dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const stygianObserver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.StygianObserver }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GloomChaser }));

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 2, 2, gameSession.getPlayer1Id());
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      var action = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getATK()).to.equal(4);
      expect(hand[0].getHP()).to.equal(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      var action = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getATK()).to.equal(6);
      expect(hand[0].getHP()).to.equal(6);
    });

    it('expect infest to deal 2 damage to the enemy General when the targeted minion is destroyed, and spread to nearby enemies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 2, 2, gameSession.getPlayer2Id());
      const valeHunter2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 2, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Infest }));
      var action = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var action = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var action = player1.actionPlayCardFromHand(0, 2, 3);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });
  });
});
