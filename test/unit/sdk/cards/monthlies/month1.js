var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("monthlies", function() {
  describe("month 1", function() {
    beforeEach(function () {
      var player1Deck = [
        {id: SDK.Cards.Faction6.General},
      ];

      var player2Deck = [
        {id: SDK.Cards.Faction1.General},
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect black locust to summon a fresh copy of itself nearby its movement destination', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var blackLocust = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BlackLocust}, 1, 2, gameSession.getPlayer1Id());

      blackLocust.refreshExhaustion();
      var action = blackLocust.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      blackLocust.refreshExhaustion();
      var action = blackLocust.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);

      var locusts = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.BlackLocust);

      expect(locusts[2].getHP()).to.equal(2);
    });
    it('expect black locust to copy to not retain buffs and damage', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var blackLocust = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BlackLocust}, 1, 2, gameSession.getPlayer1Id());
      blackLocust.setDamage(1);

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GreaterFortitude}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

      blackLocust.refreshExhaustion();
      var action = blackLocust.actionMove({ x: 0, y: 0 });
      gameSession.executeAction(action);

      var locusts = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.BlackLocust);

      expect(locusts[0].getHP()).to.equal(3);
      expect(locusts[0].getATK()).to.equal(4);
      expect(locusts[1].getHP()).to.equal(2);
      expect(locusts[1].getATK()).to.equal(2);
    });
    it('expect wind runner to give +1/+1 to friendly minions nearby its movement destination', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var windRunner = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WindRunner}, 1, 2, gameSession.getPlayer1Id());
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 3, 2, gameSession.getPlayer1Id());
      var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 3, gameSession.getPlayer1Id());

      windRunner.refreshExhaustion();
      var action = windRunner.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      expect(brightmossGolem.getHP()).to.equal(10);
      expect(brightmossGolem2.getHP()).to.equal(10);
      expect(brightmossGolem.getATK()).to.equal(5);
      expect(brightmossGolem2.getATK()).to.equal(5);
      expect(windRunner.getHP()).to.equal(3);
      expect(windRunner.getATK()).to.equal(3);
    });
    it('expect ghost lynx to move any nearby minion into a random space', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.GhostLynx}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      var brightmossGolem = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.BrightmossGolem);

      expect(brightmossGolem.getPosition().x !== 1 || brightmossGolem.getPosition().y !== 2).to.equal(true);
    });
    it('expect mogwai to draw a card every time it moves', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var mogwai = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mogwai}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.SpectralRevenant}));

      mogwai.refreshExhaustion();
      var action = mogwai.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
    });
  });
});
