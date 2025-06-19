const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('monthlies', () => {
  describe('month 3', () => {
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

    it('expect prophet of the white palm to prevent all spell damage to allies until your next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ProphetWhitePalm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      const prophet = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.ProphetWhitePalm);

      expect(prophet.getDamage()).to.equal(0);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(0);
    });

    it('expect prophet of the white palm to prevent all spell damage to enemies until your next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const khymera = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Khymera }, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ProphetWhitePalm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const prophet = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.ProphetWhitePalm);

      expect(khymera.getDamage()).to.equal(0);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });

    it('expect sun elemental to give 2 random friendly minions +2 health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const khymera = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Khymera }, 0, 0, gameSession.getPlayer1Id());
      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SunElemental }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(khymera.getHP()).to.equal(14);
      expect(valeHunter.getHP()).to.equal(4);
    });

    it('expect araki headhunter to gain +2 attack every time you summon a minion with opening gambit', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const araki = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArakiHeadhunter }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EmeraldRejuvenator }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EmeraldRejuvenator }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(araki.getATK()).to.equal(5);
    });

    it('expect araki headhunter to not gain +2 attack when summoning a unit with a different keyword than opening gambit', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const araki = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArakiHeadhunter }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EmeraldRejuvenator }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PlanarScout }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(araki.getATK()).to.equal(3);
    });

    it('expect araki headhunter to gain +2 attack when summoning a unit with a \'plain\' opening gambit', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const araki = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArakiHeadhunter }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EphemeralShroud }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EphemeralShroud }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(araki.getATK()).to.equal(5);
    });

    it('expect keeper of the vale to revive a friendly minion destroyed this game', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 0, 0, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.KeeperOfTheVale }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 1);
      gameSession.executeAction(followupAction);

      const newVH = board.getUnitAtPosition({ x: 2, y: 1 });

      expect(newVH.getId()).to.equal(SDK.Cards.Neutral.ValeHunter);
    });
  });
});
