const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');
const ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('monthlies', () => {
  describe('month 13', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect azure herald to restore 3 health to your general when played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      gameSession.getGeneralForPlayer1().setDamage(10);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.AzureHerald }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(7);
    });

    it('expect zyx to summon a clone of itself in a nearby space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Zyx }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.getGeneralForPlayer1().refreshExhaustion();
      const action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
      gameSession.executeAction(action);

      const clone = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 1, y: 1 }));
      expect(clone[0].getId()).to.equal(SDK.Cards.Neutral.Zyx);
    });

    it('expect zyxs clone to also copy buffs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.KineticSurge }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Zyx }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      gameSession.getGeneralForPlayer1().refreshExhaustion();
      const action = gameSession.getGeneralForPlayer1().actionMove({ x: 0, y: 4 });
      gameSession.executeAction(action);

      const clone = board.getFriendlyEntitiesAroundEntity(board.getUnitAtPosition({ x: 1, y: 1 }));
      expect(clone[0].getId()).to.equal(SDK.Cards.Neutral.Zyx);
      expect(clone[0].getHP()).to.equal(3);
      expect(clone[0].getATK()).to.equal(2);
    });

    it('expect ironclad to dispel all enemy minions upon death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const shadowDancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.SharianShadowdancer }, 6, 2, gameSession.getPlayer2Id());
      const shadowWatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.ShadowWatcher }, 5, 2, gameSession.getPlayer2Id());
      const vorpalReaver = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 4, 2, gameSession.getPlayer2Id());

      const ironclad = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Ironclad }, 7, 2, gameSession.getPlayer1Id());
      ironclad.setDamage(2);
      ironclad.refreshExhaustion();
      const action = ironclad.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(shadowDancer.getIsSilenced()).to.equal(true);
      expect(shadowWatcher.getIsSilenced()).to.equal(true);
      expect(vorpalReaver.getIsSilenced()).to.equal(true);
    });

    it('expect decimus to deal 2 damage to the enemy general whenever they draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const decimus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Decimus }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PhaseHound }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PhaseHound }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });
  });
});
