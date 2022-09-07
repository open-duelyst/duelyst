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
  describe("month 4", function() {
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

    it('expect white widow to deal 2 damage to a random enemy when you replace', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var aethermaster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Aethermaster}, 1, 2, gameSession.getPlayer1Id());
      var whiteWidow = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhiteWidow}, 2, 2, gameSession.getPlayer1Id());
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 6, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Metamorphosis}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);
      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var totalDamage = brightmossGolem.getDamage() + gameSession.getGeneralForPlayer2().getDamage();
      expect(totalDamage).to.equal(4);
    });

		/*
    it('expect astral crusader to gain +1/+1 and cost 1 less each time you replace him', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var aethermaster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Aethermaster}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AstralCrusader}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.AstralCrusader)
			expect(cardDraw.getManaCost()).to.equal(7);
      expect(cardDraw.getATK()).to.equal(7);
      expect(cardDraw.getHP()).to.equal(6);

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);
      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.AstralCrusader)
			expect(cardDraw.getManaCost()).to.equal(6);
      expect(cardDraw.getATK()).to.equal(8);
      expect(cardDraw.getHP()).to.equal(7);
    });
		*/

    it('expect wings of paradise to gain +2 attack until end of turn when you replace a card', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var aethermaster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Aethermaster}, 1, 2, gameSession.getPlayer1Id());
      var wings = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WingsOfParadise}, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Metamorphosis}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.GhostLightning}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);
      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      expect(wings.getATK()).to.equal(7);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(wings.getATK()).to.equal(3);
    });
    it('expect dreamgazer to be summoned into play when replaced and deal 2 damage to own general', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Dreamgazer}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      var action = player1.actionReplaceCardFromHand(0);
      gameSession.executeAction(action);

      var dreamgazer = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.Dreamgazer);

      expect(dreamgazer.getHP()).to.equal(1);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);

      var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });
  });
});
