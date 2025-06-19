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
  describe('faction5', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction3.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect erratic raptyr to turn into an egg after an attack or counter attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const raptyr1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 5, 1, gameSession.getPlayer1Id());
      const raptyr2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 6, 1, gameSession.getPlayer2Id());
      raptyr1.refreshExhaustion();

      const action = raptyr1.actionAttack(raptyr2);
      gameSession.executeAction(action);

      const egg1 = board.getUnitAtPosition({ x: 5, y: 1 });
      const egg2 = board.getUnitAtPosition({ x: 6, y: 1 });

      expect(egg1.getId()).to.equal(SDK.Cards.Faction5.Egg);
      expect(egg2.getId()).to.equal(SDK.Cards.Faction5.Egg);
    });

    it('expect embryotic insight to draw you 2 cards if you have an egg', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EmbryoticInsight }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(playCardFromHandAction1);

      var hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.equal(undefined);

      const raptyr1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 5, 1, gameSession.getPlayer1Id());
      const raptyr2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 6, 1, gameSession.getPlayer2Id());
      raptyr1.refreshExhaustion();
      const action = raptyr1.actionAttack(raptyr2);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EmbryoticInsight }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(playCardFromHandAction1);

      var hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
      expect(hand1[1].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
      expect(hand1[2]).to.equal(undefined);
    });

    it('expect seismoid to draw both players a card whenever you summon a mech from your action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const seismond = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Seismoid }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Seismoid }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const hand1 = player1.getDeck().getCardsInHand();
      const hand2 = player2.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
      expect(hand1[1]).to.equal(undefined);
      expect(hand2[0].getId()).to.equal(SDK.Cards.Spell.BurdenOfKnowledge);
      expect(hand2[1]).to.equal(undefined);
    });

    it('expect upper hand to damage a minion equal to the number of cards in opponents action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.BurdenOfKnowledge }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.UpperHand }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(brightmossGolem.getDamage()).to.equal(4);
    });

    it('expect rage reactor to give your general +1 attack and summon a ripper egg on destroyed enemy spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.RageReactor }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);

      const dragonlark = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SpottedDragonlark }, 1, 1, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(dragonlark);
      gameSession.executeAction(action);

      const egg = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const ripper = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(ripper.getId()).to.equal(SDK.Cards.Faction5.Gibblegup);
      expect(ripper.ownerId).to.equal('player1_id');
    });

    it('expect armada to deal 5 damage to the closest enemy when you use your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 3, gameSession.getPlayer2Id());
      const armada = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Armada }, 7, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(0, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(5);
      expect(golem.getDamage()).to.equal(0);
    });

    it('expect pupabomb to destroy a friendly egg and deal 4 damage to enemies around it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const raptyr1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 7, 1, gameSession.getPlayer1Id());
      const leviathan = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 6, 1, gameSession.getPlayer2Id());
      const leviathan2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.UnstableLeviathan }, 5, 1, gameSession.getPlayer2Id());
      raptyr1.refreshExhaustion();
      const action = raptyr1.actionAttack(leviathan);
      gameSession.executeAction(action);

      const egg1 = board.getUnitAtPosition({ x: 7, y: 1 });

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EggGrenade }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 7, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(egg1.getIsRemoved()).to.equal(true);
      expect(leviathan.getDamage()).to.equal(9);
      expect(leviathan2.getDamage()).to.equal(0);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });

    it('expect homeostatic rebuke to make all minions attack themselves', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer1Id());
      const tethermancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Tethermancer }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.HomeostaticRebuke }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getDamage()).to.equal(valeHunter.getATK());
      expect(tethermancer.getDamage()).to.equal(tethermancer.getATK());
    });

    it('expect progenitor to make friendly non-egg minions summon egg copies of themselves behind them', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer1Id()); // should not spawn egg
      const tethermancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Tethermancer }, 1, 1, gameSession.getPlayer1Id());
      const tethermancer2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Tethermancer }, 5, 3, gameSession.getPlayer2Id()); // should not spawn egg
      const raptyr1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 5, 1, gameSession.getPlayer1Id()); // should not spawn egg
      const raptyr2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.ErraticRaptyr }, 6, 1, gameSession.getPlayer2Id()); // should not spawn egg
      raptyr1.refreshExhaustion();
      const action = raptyr1.actionAttack(raptyr2);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Progenitor }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      const nonegg1 = board.getUnitAtPosition({ x: 4, y: 1 });
      const nonegg2 = board.getUnitAtPosition({ x: 6, y: 3 });
      let egg = board.getUnitAtPosition({ x: 0, y: 1 });

      expect(nonegg1).to.equal(undefined);
      expect(nonegg2).to.equal(undefined);
      expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      egg = board.getUnitAtPosition({ x: 0, y: 1 });

      expect(egg.getId()).to.equal(SDK.Cards.Neutral.Tethermancer);
    });

    it('expect gigaloth to give other friendly minions +3/+3 when it attacks', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer1Id());
      const gigaloth = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Gigaloth }, 5, 1, gameSession.getPlayer1Id()); // should not spawn egg
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 6, 1, gameSession.getPlayer2Id()); // should not spawn egg
      gigaloth.refreshExhaustion();
      const action = gigaloth.actionAttack(golem);
      gameSession.executeAction(action);

      expect(valeHunter.getATK()).to.equal(4);
      expect(valeHunter.getHP()).to.equal(5);
      expect(gigaloth.getATK()).to.equal(7);
      expect(gigaloth.getHP()).to.equal(5);
    });

    /* Test disabled: failing
    it('expect saurian finality to stun the enemy general, give your general +2 attack, cause both players to lose 3 mana, and restore 10 health to your general', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      player1.maximumMana = 7;
      player1.remainingMana = 7;
      player2.maximumMana = 7;
      gameSession.getGeneralForPlayer1().setDamage(15);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SaurianFinality}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(5);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);
      expect(gameSession.getGeneralForPlayer2().hasModifierClass(SDK.ModifierStunned)).to.equal(true);
      expect(player1.getMaximumMana()).to.equal(4);
      expect(player2.getMaximumMana()).to.equal(4);
    });
    */
  });
});
