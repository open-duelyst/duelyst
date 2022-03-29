var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('../../../../app/common/config');
var Logger = require('../../../../app/common/logger');
var SDK = require('../../../../app/sdk');
var UtilsSDK = require('./../../../utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("game mulligan", function() {

	beforeEach(function () {
		// get all cards
		var allCards = SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getIsGeneral(false).getCards();
		var cardsThatCost1 = _.filter(allCards, function (card) {
			return card.getManaCost() === 1
				&& (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1)
				&& (card.modifiersContextObjects == null || card.modifiersContextObjects.length === 0);
		});
		var cardsThatCost4Plus = _.filter(allCards, function (card) {
			return card.getManaCost() >= 4 && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1);
		});

		// define test decks
		var playerDecks = [
			{id: SDK.Cards.Faction1.General},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost4Plus).getId()},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost1).getId()}
		];

		// setup test session
		UtilsSDK.setupSession(playerDecks, playerDecks);
	});

	afterEach(function () {
		SDK.GameSession.reset();
	});

	it("expect game to be new before both players have drawn starting hand", function() {
		expect(SDK.GameSession.getInstance().isNew()).to.equal(true);
	});

	it('expect player to have same starting hand after mulligan nothing', function () {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var handBefore = player.getDeck().getHand().slice(0);
		var drawStartingHandAction = player.actionDrawStartingHand();
		SDK.GameSession.getInstance().executeAction(drawStartingHandAction);
		var handAfter = player.getDeck().getHand();
		var pass = true;
		for (var i = 0, il = handAfter.length; i < il; i++) {
			if (handAfter[i] !== handBefore[i]) {
				pass = false;
				break;
			}
		}

		expect(pass).to.equal(true);
	});

	it("expect invalid action when not draw starting hand during mulligan", function() {
		var player = SDK.GameSession.getInstance().getPlayer2();
		var cardsInHand = player.getDeck().getCardsInHand();
		var indexToPlay = -1;
		var cardToPlay = null;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.getManaCost() <= player.getRemainingMana()) {
				cardToPlay = card;
				indexToPlay = i;
				break;
			}
		}
		var validTargetPositions = cardToPlay.getValidTargetPositions();
		var validTargetPosition = _.sample(validTargetPositions);
		var playCardFromHandAction = player.actionPlayCardFromHand(indexToPlay, validTargetPosition.x, validTargetPosition.y);
		SDK.GameSession.getInstance().executeAction(playCardFromHandAction);

		expect(playCardFromHandAction.getIsValid()).to.equal(false);
	});

	it('expect player to have different starting hand after mulligan something', function () {
		var player = SDK.GameSession.getInstance().getPlayer2();
		var handBefore = player.getDeck().getHand().slice(0);
		var indicesToMulligan = [];
		for (var i = 0, il = handBefore.length; i < il; i++) {
			var cardIndex = handBefore[i];
			if (cardIndex != null && indicesToMulligan.length < CONFIG.STARTING_HAND_REPLACE_COUNT) {
				indicesToMulligan.push(i);
			}
		}
		var drawStartingHandAction = player.actionDrawStartingHand(indicesToMulligan);
		SDK.GameSession.getInstance().executeAction(drawStartingHandAction);
		var handAfter = player.getDeck().getHand();
		var pass = false;
		for (var i = 0, il = handAfter.length; i < il; i++) {
			if (handAfter[i] !== handBefore[i]) {
				pass = true;
				break;
			}
		}

		expect(pass).to.equal(true);
	});

	it("expect game to be active after both players have drawn starting hand", function() {
		SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getPlayer1().actionDrawStartingHand());
		SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getPlayer2().actionDrawStartingHand());
		expect(SDK.GameSession.getInstance().isActive()).to.equal(true);
	});

});
