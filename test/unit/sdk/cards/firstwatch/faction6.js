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

describe('first watch', () => {
  describe('faction6', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect freeblade to switch positions with the first minion your opponent summons', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.Freeblade }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction4.GloomChaser }));

      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const freeblade = board.getUnitAtPosition({ x: 8, y: 1 });
      const gloomchaser = board.getUnitAtPosition({ x: 1, y: 1 });

      expect(freeblade.getId()).to.equal(SDK.Cards.Faction6.Freeblade);
      expect(gloomchaser.getId()).to.equal(SDK.Cards.Faction4.GloomChaser);
    });

    it('expect crystal arbiter to gain +3 attack on your opponents turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const crystalArbiter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalArbiter }, 2, 1, gameSession.getPlayer1Id());

      expect(crystalArbiter.getATK()).to.equal(1);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(crystalArbiter.getATK()).to.equal(4);
    });

    it('expect vespyrian might to give +2/+2 for each friendly vespyr minion on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const crystalArbiter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalArbiter }, 2, 1, gameSession.getPlayer1Id());
      const crystalArbiter2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalArbiter }, 3, 1, gameSession.getPlayer1Id());
      const crystalArbiter3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalArbiter }, 4, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.VespyrianMight }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(crystalArbiter.getATK()).to.equal(7);
      expect(crystalArbiter.getHP()).to.equal(10);
    });

    it('expect blinding snowstorm to deal 1 damage to all enemies and reduce their movement to 1 next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      const crystalArbiter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalArbiter }, 2, 1, gameSession.getPlayer2Id());
      const flyer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.FlameWing }, 3, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BlindingSnowstorm }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(crystalArbiter.getDamage()).to.equal(1);
      expect(flyer.getDamage()).to.equal(1);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(false);
      var action = gameSession.getGeneralForPlayer2().actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(true);

      var action = crystalArbiter.actionMove({ x: 4, y: 1 });
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(false);
      var action = crystalArbiter.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(true);

      var action = flyer.actionMove({ x: 6, y: 3 });
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(false);
      var action = flyer.actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      expect(action.getIsValid()).to.equal(true);
    });

    it('expect drake dowager to transform when the enemy general attacks and to summon a 4/4 drake when it attacks', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.DrakeDowager }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 8, 1, gameSession.getPlayer1Id());

      var action = gameSession.getGeneralForPlayer2().actionAttack(wraithling);
      gameSession.executeAction(action);

      const dowager = board.getUnitAtPosition({ x: 1, y: 1 });

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
      gameSession.executeAction(action);

      expect(dowager.getATK()).to.equal(1);

      var action = dowager.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const drake = board.getEntitiesAroundEntity(dowager);

      expect(drake[0].getId()).to.equal(SDK.Cards.Faction6.AzureDrake);
    });

    it('expect moonlit basilysk to gain +3/+3 when your opponent casts a spell', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;
      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.MoonlitBasilysk }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InklingSurge }));

      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.InklingSurge }));
      var playCardFromHandAction1 = player2.actionPlayCardFromHand(0, 8, 3);
      gameSession.executeAction(playCardFromHandAction1);

      expect(board.getUnitAtPosition({ x: 1, y: 1 }).getATK()).to.equal(8);
      expect(board.getUnitAtPosition({ x: 1, y: 1 }).getHP()).to.equal(8);
    });

    it('expect luminous charge to summon 5 0/1 walls that explode for 2 on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const terrodon = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction5.Terradon }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LuminousCharge }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 4);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 4);
      gameSession.executeAction(followupAction2);
      const followupCard3 = followupAction2.getCard().getCurrentFollowupCard();
      const followupAction3 = player1.actionPlayFollowup(followupCard3, 2, 4);
      gameSession.executeAction(followupAction3);
      const followupCard4 = followupAction3.getCard().getCurrentFollowupCard();
      const followupAction4 = player1.actionPlayFollowup(followupCard4, 2, 3);
      gameSession.executeAction(followupAction4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(terrodon.getDamage()).to.equal(2);
    });

    it('expect shivers to give you 1 mana crystal when it attacks infiltrated', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      const shivers = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Shivers }, 8, 3, gameSession.getPlayer1Id());
      shivers.refreshExhaustion();

      const action = shivers.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(player1.getRemainingMana()).to.equal(4);
    });

    it('expect glacial fissure to deal 8 damage to everything in the center column', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const dragonboneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.DragoneboneGolem }, 4, 3, gameSession.getPlayer1Id());
      const dragonboneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.DragoneboneGolem }, 4, 1, gameSession.getPlayer2Id());

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GlacialFissure }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(dragonboneGolem.getDamage()).to.equal(8);
      expect(dragonboneGolem2.getDamage()).to.equal(8);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(8);
    });

    it('expect icebreak ambush to summon two snowchasers, a crystal cloaker, and a wolf raven on your opponents side of board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SnowPatrol }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 3);
      gameSession.executeAction(playCardFromHandAction);

      const snowchasers = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.WyrBeast);
      const cloaker = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.CrystalCloaker);
      const wolfraven = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.WolfRaven);

      expect(snowchasers.length).to.equal(2);
      expect(cloaker.length).to.equal(1);
      expect(wolfraven.length).to.equal(1);

      expect(snowchasers[0].getPosition().x).to.be.above(4);
      expect(snowchasers[1].getPosition().x).to.be.above(4);
      expect(cloaker[0].getPosition().x).to.be.above(4);
      expect(wolfraven[0].getPosition().x).to.be.above(4);
    });

    it('expect matron elveiti to stop minions from attacking your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      const matron = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.MatronElveiti }, 8, 3, gameSession.getPlayer2Id());
      const snowchaser = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WyrBeast }, 7, 2, gameSession.getPlayer1Id());
      snowchaser.refreshExhaustion();

      const action = snowchaser.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(action.getIsValid()).to.equal(false);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });

    it('expect flawless reflection to transform all nearby minions into selected minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const matron = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.MatronElveiti }, 8, 3, gameSession.getPlayer2Id());
      const snowchaser = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WyrBeast }, 7, 2, gameSession.getPlayer1Id());
      const snowchaser2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.WyrBeast }, 7, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FlawlessReflection }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(board.getUnitAtPosition({ x: 7, y: 2 }).getId()).to.equal(SDK.Cards.Faction6.MatronElveiti);
      expect(board.getUnitAtPosition({ x: 7, y: 3 }).getId()).to.equal(SDK.Cards.Faction6.MatronElveiti);
    });

    it('expect the dredger to teleport an enemy to your starting side of the battlefield after you damage an enemy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      var matron = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.MatronElveiti }, 5, 2, gameSession.getPlayer2Id());

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      gameSession.getGeneralForPlayer1().refreshExhaustion();
      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.TheDredger }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 3);
      gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionAttack(matron);
      gameSession.executeAction(action);

      var matron = UtilsSDK.getEntityOnBoardById(SDK.Cards.Faction6.MatronElveiti);

      expect(matron.getPosition().x).to.be.below(4);
    });
  });
});
