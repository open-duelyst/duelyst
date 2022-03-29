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

describe("actions: hand", function() {

	beforeEach(function () {
		// get all cards
		var allCards = SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getIsGeneral(false).getCards();
		var cardsThatCost1 = _.filter(allCards, function (card) {
			return card.getManaCost() === 1
				&& (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1)
				&& !card.getHasFollowups()
				&& (card.modifiersContextObjects == null || card.modifiersContextObjects.length === 0);
		});
		var cardsThatCost4Plus = _.filter(allCards, function (card) {
			return card.getManaCost() >= 4 && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1);
		});
		var cardsWithAirdrop = _.filter(allCards, function (card) {
			return card.modifiersContextObjects != null
				&& _.find(card.modifiersContextObjects, function (contextObject) { return contextObject.type === SDK.ModifierAirdrop.type; }) != null
				&& !card.getHasFollowups()
				&& (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1);
		});

		// define test decks
		var player1CardInDeck = cardsThatCost1.splice(Math.floor(Math.random() * cardsThatCost1.length), 1)[0];
		var player1Deck = [
			{id: SDK.Cards.Faction1.General},
			{id: player1CardInDeck.getId()},
			{id: player1CardInDeck.getId()},
			{id: player1CardInDeck.getId()},
			{id: _.sample(cardsWithAirdrop).getId()},
			{id: _.sample(cardsThatCost4Plus).getId()},
			{id: _.sample(cardsThatCost1).getId()}
		];
		var player2Card = _.sample(cardsThatCost1);
		var player2Deck = [
			{id: SDK.Cards.Faction1.General},
			{id: player2Card.getId()},
			{id: player2Card.getId()},
			{id: player2Card.getId()},
			{id: player2Card.getId()},
			{id: player2Card.getId()},
			{id: player2Card.getId()}
		];

		// setup test session
		UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
	});

	afterEach(function () {
		SDK.GameSession.reset();
	});

	it('expect invalid play card action when targeting invalid location', function() {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var cardsInHand = player.getDeck().getCardsInHand();
		var indexToPlay = -1;
		var cardToPlay = null;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.getManaCost() === 1) {
				cardToPlay = card;
				indexToPlay = i;
				break;
			}
		}
		var validTargetPositions = cardToPlay.getValidTargetPositions();
		var allBoardPositions = SDK.GameSession.getInstance().getBoard().getPositions();
		var invalidTargetPosition;
		for (var i = 0, il = allBoardPositions.length; i < il; i++) {
			var boardPosition = allBoardPositions[i];
			var positionIsValid = false;
			for (var j = 0, jl = validTargetPositions.length; j < jl; j++) {
				var validPosition = validTargetPositions[j];
				if (boardPosition.x === validPosition.x && boardPosition.y === validPosition.y) {
					positionIsValid = true;
					break;
				}
			}
			if (!positionIsValid) {
				invalidTargetPosition = boardPosition;
			}
		}
		var playCardFromHandAction = player.actionPlayCardFromHand(indexToPlay, invalidTargetPosition.x, invalidTargetPosition.y);
		SDK.GameSession.getInstance().executeAction(playCardFromHandAction);

		expect(playCardFromHandAction.getIsValid()).to.equal(false);
	});

	it('expect invalid play card action if card costs too much mana', function() {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var cardsInHand = player.getDeck().getCardsInHand();
		var indexToPlay = -1;
		var cardToPlay = null;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.getManaCost() > player.getRemainingMana()) {
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

	it('expect airdrop unit valid target position to be anywhere', function() {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var cardsInHand = player.getDeck().getCardsInHand();
		var cardToPlay = null;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.hasModifierClass(SDK.ModifierAirdrop)) {
				cardToPlay = card;
				break;
			}
		}

		expect(cardToPlay.getCanBeAppliedAnywhere()).to.equal(true);
	});

	it('expect replace card to find different card', function() {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var cardsInHand = player.getDeck().getCardsInHand();
		var indexReplaced = -1;
		var cardReplaced = null;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.getManaCost() > player.getRemainingMana()) {
				cardReplaced = card;
				indexReplaced = i;
				break;
			}
		}
		var replaceCardFromHandAction = player.actionReplaceCardFromHand(indexReplaced);
		SDK.GameSession.getInstance().executeAction(replaceCardFromHandAction);

		expect(SDK.GameSession.getInstance().getPlayer1().getDeck().getCardIndexInHandAtIndex(indexReplaced)).to.not.equal(cardReplaced.getIndex());
	});

	it('expect invalid replace card action after already replaced a card', function() {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var cardsInHand = player.getDeck().getCardsInHand();
		var indexReplaced = -1;
		var cardReplaced = null;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.getManaCost() > player.getRemainingMana()) {
				cardReplaced = card;
				indexReplaced = i;
				break;
			}
		}
		var replaceCardFromHandActionValid = player.actionReplaceCardFromHand(indexReplaced);
		SDK.GameSession.getInstance().executeAction(replaceCardFromHandActionValid);

		var hand = player.getDeck().getHand();
		var indexToReplace = -1;
		for (var i = 0, il = hand.length; i < il; i++) {
			var cardIndex = hand[i];
			if (cardIndex != null) {
				indexToReplace = i;
				break;
			}
		}
		var replaceCardFromHandActionInvalid = player.actionReplaceCardFromHand(indexToReplace);
		SDK.GameSession.getInstance().executeAction(replaceCardFromHandActionInvalid);

		expect(replaceCardFromHandActionInvalid.getIsValid()).to.equal(false);
	});

	it('expect hand slot be empty after playing a card', function() {
		var player = SDK.GameSession.getInstance().getPlayer1();
		var cardsInHand = player.getDeck().getCardsInHand();
		var indexToPlay = -1;
		for (var i = 0, il = cardsInHand.length; i < il; i++) {
			var card = cardsInHand[i];
			if (card && card.getManaCost() === 1) {
				indexToPlay = i;
				break;
			}
		}
		var general = SDK.GameSession.getInstance().getGeneralForPlayerId(player.getPlayerId());
		var generalPosition = general.getPosition();
		var playCardFromHandAction = player.actionPlayCardFromHand(indexToPlay, generalPosition.x + 1, generalPosition.y);
		SDK.GameSession.getInstance().executeAction(playCardFromHandAction);

		expect(player.getDeck().getHand()[indexToPlay]).to.equal(null);
	});

});
