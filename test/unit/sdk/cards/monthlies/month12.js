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
  describe('month 12', () => {
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

    it('expect day watcher to restore 1 health to your general whenever any of your minions attacks', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const daywatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.DayWatcher }, 1, 1, gameSession.getPlayer1Id());

      const damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(15);
      UtilsSDK.executeActionWithoutValidation(damageAction);

      const wraithling1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 8, 1, gameSession.getPlayer1Id());
      const wraithling2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 8, 3, gameSession.getPlayer1Id());
      const wraithling3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 7, 1, gameSession.getPlayer1Id());

      wraithling1.refreshExhaustion();
      wraithling2.refreshExhaustion();
      wraithling3.refreshExhaustion();

      var action = wraithling1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = wraithling2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = wraithling3.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(13);
    });

    it('expect dust wailer deal 3 damage to only enemies in the row in front of it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const daywatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.DayWatcher }, 6, 2, gameSession.getPlayer1Id());
      const reaver1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 8, 1, gameSession.getPlayer2Id());
      const reaver2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 7, 2, gameSession.getPlayer2Id());
      const reaver3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.VorpalReaver }, 4, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.DustWailer }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(daywatcher.getDamage()).to.equal(0);
      expect(reaver1.getDamage()).to.equal(0);
      expect(reaver2.getDamage()).to.equal(3);
      expect(reaver3.getDamage()).to.equal(0);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
    });

    it('expect night watcher to exhaust all minions who enter play with rush', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const nightwatcher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.NightWatcher }, 6, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SaberspineTiger }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      const tiger1 = board.getUnitAtPosition({ x: 5, y: 2 });
      var action = tiger1.actionMove({ x: 4, y: 3 });
      gameSession.executeAction(action);
      expect(tiger1.getPosition().x).to.equal(5);
      expect(tiger1.getPosition().y).to.equal(2);

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.SaberspineTiger }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      const tiger2 = board.getUnitAtPosition({ x: 7, y: 2 });
      var action = tiger2.actionMove({ x: 6, y: 3 });
      gameSession.executeAction(action);
      expect(tiger2.getPosition().x).to.equal(7);
      expect(tiger2.getPosition().y).to.equal(2);
    });

    it('expect quartermaster gauj to not take damage from the enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const gauj = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.QuartermasterGauj }, 7, 2, gameSession.getPlayer1Id());

      gauj.refreshExhaustion();

      const action = gauj.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(5);
      expect(gauj.getDamage()).to.equal(0);
    });

    it('expect quartermaster gauj to not take damage from enemy minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const gauj = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.QuartermasterGauj }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      gauj.refreshExhaustion();

      const action = gauj.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(5);
      expect(gauj.getDamage()).to.equal(0);
    });

    it('expect quartermaster gauj to not take damage from enemy minion abilities', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const gauj = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.QuartermasterGauj }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.DustWailer }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gauj.getDamage()).to.equal(0);
    });

    it('expect quartermaster gauj to take damage from spells', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const gauj = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.QuartermasterGauj }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gauj.getDamage()).to.equal(1);
    });
  });
});
