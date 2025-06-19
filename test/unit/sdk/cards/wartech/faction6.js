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

    it('expect cryoblade to deal double damage to stunned enemies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const cryoblade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.FrostbladeFiend }, 5, 1, gameSession.getPlayer1Id());
      const blade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 6, 1, gameSession.getPlayer2Id());
      cryoblade.refreshExhaustion();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FrigidCorona }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const action = cryoblade.actionAttack(blade);
      gameSession.executeAction(action);

      expect(blade.getDamage()).to.equal(4);
    });

    it('expect aspect of the bear to turn a minion into a 4/5 that cant counterattack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const cryoblade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.FrostbladeFiend }, 5, 1, gameSession.getPlayer1Id());
      const blade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 6, 1, gameSession.getPlayer2Id());
      cryoblade.refreshExhaustion();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AspectOfBear }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const ursaplomb = board.getUnitAtPosition({ x: 6, y: 1 });
      expect(ursaplomb.getId()).to.equal(SDK.Cards.Faction6.Ursaplomb);

      const action = cryoblade.actionAttack(ursaplomb);
      gameSession.executeAction(action);

      expect(ursaplomb.getDamage()).to.equal(2);
      expect(cryoblade.getDamage()).to.equal(0);
    });

    it('expect shatter to destroy a stunned minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const blade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 6, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FrigidCorona }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Shatter }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(blade.getIsRemoved()).to.equal(true);
    });

    it('expect echo deliverant to clone any mech unit you summon nearby', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const echo = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.EchoDeliverant }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AerialRift }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction5.Seismoid }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 3);
      gameSession.executeAction(playCardFromHandAction1);

      const mech = board.getUnitAtPosition({ x: 3, y: 3 });
      const duplicate = board.getEntitiesAroundEntity(mech);
      expect(duplicate[0].getId()).to.equal(SDK.Cards.Faction5.Seismoid);
    });

    it('expect essence sculpt to put a copy of a stunned minion in your hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const blade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 6, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FrigidCorona }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EssenceSculpt }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.WhistlingBlade);
    });

    it('expect animus plate to give +2 attack and give all friendly vespyrs +2/+2 when attacking or counterattacking', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AnimusPlate }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 0, 0, gameSession.getPlayer1Id());
      const circulus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Circulus }, 5, 1, gameSession.getPlayer1Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 1, 2, gameSession.getPlayer2Id());

      let action = gameSession.getGeneralForPlayer1().actionAttack(golem);
      gameSession.executeAction(action);

      expect(cloaker.getATK()).to.equal(4);
      expect(cloaker.getHP()).to.equal(5);
      expect(circulus.getATK()).to.equal(1);
      expect(circulus.getHP()).to.equal(1);

      gameSession.executeAction(gameSession.actionEndTurn());

      action = golem.actionAttack(gameSession.getGeneralForPlayer1());
      gameSession.executeAction(action);

      expect(cloaker.getATK()).to.equal(6);
      expect(cloaker.getHP()).to.equal(7);
      expect(circulus.getATK()).to.equal(1);
      expect(circulus.getHP()).to.equal(1);
    });

    it('expect hydrogarm to deal 1 damage to enemy minions in his row and stun them when using bbs', () => {
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
      const hydrogarm = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Hydrogarm }, 7, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(0, 1);
      gameSession.executeAction(action);

      expect(golem.hasModifierClass(SDK.ModifierStunned)).to.equal(true);
      expect(golem.getDamage()).to.equal(1);
    });

    it('expect crystalline reinforcement to give friendly minions +attack/+health equal to their current bonus attack and health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AnimusPlate }));
      let playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 0, 0, gameSession.getPlayer1Id());
      const cloaker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 7, 0, gameSession.getPlayer1Id());
      const circulus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.Circulus }, 5, 1, gameSession.getPlayer1Id());
      const blade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 3, 2, gameSession.getPlayer1Id());
      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WhistlingBlade }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(golem);
      gameSession.executeAction(action);

      expect(cloaker.getATK()).to.equal(4);
      expect(cloaker.getHP()).to.equal(5);
      expect(cloaker2.getATK()).to.equal(6);
      expect(cloaker2.getHP()).to.equal(5);
      expect(circulus.getATK()).to.equal(1);
      expect(circulus.getHP()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LastingJudgement }));
      playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction1);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CrystallineReinforcement }));
      playCardFromHandAction1 = player1.actionPlayCardFromHand(1, 6, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(cloaker.getATK()).to.equal(6); // no infiltration active buff... 2 base + 2 buff from animus plate.  +2 from crystalline reinforcement
      expect(cloaker.getHP()).to.equal(7);
      expect(cloaker2.getATK()).to.equal(10); // 2 base + (2 from animus plate + 2 from infiltration) + 4 from crystalline reinforcement
      expect(cloaker2.getHP()).to.equal(7);
      expect(circulus.getATK()).to.equal(1);
      expect(circulus.getHP()).to.equal(1);
      expect(blade.getHP()).to.equal(9); // negative lasting judgement buff goes into place
      expect(blade.getATK()).to.equal(8); // but positive lasting judgement buff does... 2 base + 3 from LJ + 3 from crystalline reinforcement
    });

    it('expect wintertide to summon 3 2/2 vespyr winter maerids on a column', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Wintertide }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 4, 2);
      gameSession.executeAction(playCardFromHandAction1);

      const maerid1 = board.getUnitAtPosition({ x: 4, y: 3 });
      const maerid2 = board.getUnitAtPosition({ x: 4, y: 2 });
      const maerid3 = board.getUnitAtPosition({ x: 4, y: 1 });

      expect(maerid1.getId()).to.equal(SDK.Cards.Faction6.WaterBear);
      expect(maerid2.getId()).to.equal(SDK.Cards.Faction6.WaterBear);
      expect(maerid3.getId()).to.equal(SDK.Cards.Faction6.WaterBear);
    });

    it('expect denadoro to make your minions always infiltrated', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 0, 0, gameSession.getPlayer1Id());
      const cloaker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 7, 0, gameSession.getPlayer1Id());

      expect(cloaker.getATK()).to.equal(2);
      expect(cloaker.getHP()).to.equal(3);
      expect(cloaker2.getATK()).to.equal(4);
      expect(cloaker2.getHP()).to.equal(3);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.InfiltrateMaster }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      expect(cloaker.getATK()).to.equal(4);
      expect(cloaker.getHP()).to.equal(3);
      expect(cloaker2.getATK()).to.equal(4);
      expect(cloaker2.getHP()).to.equal(3);
    });

    it('expect draugar eyolith to make enemies only move 1 space while building and while active', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const cloaker2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 7, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction6.DraugarEyolith }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 6, y: 2 })).to.equal(undefined);

      action = gameSession.getGeneralForPlayer2().actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 7, y: 2 }).getId()).to.equal(SDK.Cards.Faction1.General);

      action = cloaker2.actionMove({ x: 5, y: 0 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 5, y: 0 })).to.equal(undefined);

      action = cloaker2.actionMove({ x: 6, y: 0 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 6, y: 0 }).getId()).to.equal(SDK.Cards.Faction6.CrystalCloaker);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      var action = gameSession.getGeneralForPlayer2().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 5, y: 2 })).to.equal(undefined);

      action = gameSession.getGeneralForPlayer2().actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 6, y: 2 }).getId()).to.equal(SDK.Cards.Faction1.General);

      action = cloaker2.actionMove({ x: 4, y: 0 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 4, y: 0 })).to.equal(undefined);

      action = cloaker2.actionMove({ x: 5, y: 0 });
      gameSession.executeAction(action);
      expect(board.getUnitAtPosition({ x: 5, y: 0 }).getId()).to.equal(SDK.Cards.Faction6.CrystalCloaker);
    });

    it('expect auroraboros to give all friendly minions dying wish: respawn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const cloaker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.CrystalCloaker }, 3, 0, gameSession.getPlayer1Id());
      const fenrir = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction6.FenrirWarmaster }, 7, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Auroraboros }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 7, 0);
      gameSession.executeAction(playCardFromHandAction1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 3, 0);
      gameSession.executeAction(playCardFromHandAction1);

      expect(board.getUnitAtPosition({ x: 3, y: 0 }).getId()).to.equal(SDK.Cards.Faction6.CrystalCloaker);
      expect(board.getUnitAtPosition({ x: 7, y: 0 }).getId()).to.equal(SDK.Cards.Faction6.FenrirWarmaster);
    });
  });
});
