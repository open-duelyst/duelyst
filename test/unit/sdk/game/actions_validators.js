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

describe("actions: validators", function() {

	beforeEach(function () {
		// get all cards
		var allCards = SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getIsGeneral(false).getCards();
		var cardsThatCost1 = _.filter(allCards, function (card) {
			return card.getManaCost() === 1
				&& (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1)
				&& (card.modifiersContextObjects == null || card.modifiersContextObjects.length === 0);
		});

		// define test decks
		var playerDecks = [
			{id: SDK.Cards.Faction1.General},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost1).getId()},
			{id: _.sample(cardsThatCost1).getId()}
		];

		// setup test session
		UtilsSDK.setupSession(playerDecks, playerDecks, true);
	});

	afterEach(function () {
		SDK.GameSession.reset();
	});

	it("expect invalid action when not player's turn", function() {
		var player = SDK.GameSession.getInstance().getNonCurrentPlayer();
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

});
