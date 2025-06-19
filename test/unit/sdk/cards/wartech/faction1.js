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
const ModifierProvoke = require('app/sdk/modifiers/modifierProvoke');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('wartech', () => {
  describe('faction1', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect decorated enlistee to have +3 attack only at full health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const decoratedEnlistee = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.DecoratedEnlistee }, 0, 1, gameSession.getPlayer1Id());

      expect(decoratedEnlistee.getATK()).to.equal(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(decoratedEnlistee.getATK()).to.equal(1);
    });

    it('expect vigilator to give nearby allies +3 health when built', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.Vigilator }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(silverguardSquire.getHP()).to.equal(7);
    });

    it('expect dauntless advance to prevent damage on General and nearby minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DauntlessAdvance }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
      expect(silverguardSquire.getHP()).to.equal(4);
      expect(silverguardSquire2.getHP()).to.equal(2);
    });

    it('expect steadfast formation to give provoke to friendly minions in a 2x2', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const silverguardSquire3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 2, gameSession.getPlayer1Id());
      const silverguardSquire4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SteadfastFormation }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(silverguardSquire.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(silverguardSquire2.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(silverguardSquire3.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(silverguardSquire4.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(false);
    });

    it('expect oakenheart to give friendly mechs +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const oakenheart = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Oakenheart }, 1, 1, gameSession.getPlayer1Id());
      const mechaz0rHelm = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Mechaz0rHelm }, 1, 2, gameSession.getPlayer1Id());

      expect(mechaz0rHelm.getHP()).to.equal(3);
      expect(mechaz0rHelm.getATK()).to.equal(3);
    });

    it('expect fealty to draw a card for each minion nearby your General', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const silverguardSquire3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Fealty }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.Tempest);
      expect(player1.getDeck().getCardInHandAtIndex(1).getId()).to.equal(SDK.Cards.Spell.Tempest);
    });

    it('expect sunbond pavise to give the minions above and below you +2 attack and provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.SunbondPavise }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 0, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 0, 3, gameSession.getPlayer1Id());
      const silverguardSquire3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());

      expect(silverguardSquire.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(silverguardSquire2.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(silverguardSquire3.hasActiveModifierClass(SDK.ModifierProvoke)).to.equal(false);

      expect(silverguardSquire.getATK()).to.equal(3);
      expect(silverguardSquire2.getATK()).to.equal(3);
      expect(silverguardSquire3.getATK()).to.equal(1);
    });

    it('expect prominence to summon a silverguard knight nearby your general when bbs is cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const prominence = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Prominence }, 4, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(4, 3);
      gameSession.executeAction(action);

      const knight = board.getEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
      expect(knight.length).to.equal(1);
      expect(knight[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
    });

    it('expect sunstrike to damage enemies and heal allies in a row', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      const evilSilverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 6, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Sunstrike }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(4);
      expect(evilSilverguardSquire.getHP()).to.equal(1);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
    });

    it('expect invincible to give a minion +4/+4 if at full health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Invincible }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(8);
      expect(silverguardSquire.getATK()).to.equal(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(5);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Invincible }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(5);
    });

    it('expect ironcliffe monument to transform summoned nearby minions into ironcliffe guardians', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.IroncliffeMonument }));
      var action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      var action = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(action);

      const newIroncliffe = board.getUnitAtPosition({ x: 1, y: 2 });
      expect(newIroncliffe.getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
    });

    it('expect surgeforger to give minions summoned nearby +1/+1 and gain +1/+1 when it happens', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const surgeForger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Warsmith }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(surgeForger.getHP()).to.equal(3);
      expect(surgeForger.getATK()).to.equal(3);

      expect(board.getUnitAtPosition({ x: 1, y: 3 }).getHP()).to.equal(5);
      expect(board.getUnitAtPosition({ x: 1, y: 3 }).getATK()).to.equal(2);
    });

    it('expect call to arms to give minions summoned nearby your general +3/+3 for the rest of the game', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CallToArms }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      expect(silverguardSquire.getHP()).to.equal(7);
      expect(silverguardSquire.getATK()).to.equal(4);
    });
  });
});
