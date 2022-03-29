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

describe("game setup", function() {

	beforeEach(function () {
		// define test decks
		var player1Deck = SDK.FactionFactory.factionForIdentifier(SDK.Factions.Faction1).starterDeck;
		var player2Deck = SDK.FactionFactory.factionForIdentifier(SDK.Factions.Faction2).starterDeck;

		// setup test session
		UtilsSDK.setupSession(player1Deck, player2Deck);
	});

	afterEach(function () {
		SDK.GameSession.reset();
	});

	describe("setup", function() {
		it('expect no cards to be in the void', function() {
			var cards = SDK.GameSession.getInstance().getCards();
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				expect(card.getIsLocatedInVoid()).to.equal(false);
			}
		});
	});

	describe("player 1", function() {

		it('expect general to be lyonar', function() {
			expect(SDK.GameSession.getInstance().getGeneralForPlayer1().getFactionId()).to.equal(SDK.Factions.Faction1);
		});

		it('expect player setup data deck count to match card count from draw pile + hand + board', function() {
			var gameSetupData = SDK.GameSession.getInstance().getGameSetupData();
			var playerSetupData = gameSetupData.players[0];
			var generalCount = SDK.GameSession.getInstance().getGeneralForPlayer1() != null ? 1 : 0;
			var handCount = SDK.GameSession.getInstance().getPlayer1().getDeck().getHandExcludingMissing().length;
			var drawPileCount = SDK.GameSession.getInstance().getPlayer1().getDeck().getDrawPileExcludingMissing().length;
			expect(playerSetupData.deck.length).to.equal(generalCount + handCount + drawPileCount);
		});

		it('expect player setup data starting draw pile to match draw pile', function() {
			var gameSetupData = SDK.GameSession.getInstance().getGameSetupData();
			var playerSetupData = gameSetupData.players[0];
			var startingCardDataInDrawPile = playerSetupData.startingDrawPile;
			var cardsInDrawPile = SDK.GameSession.getInstance().getPlayer1().getDeck().getCardsInDrawPile();
			for (var i = 0, il = startingCardDataInDrawPile.length; i < il; i++) {
				var cardSetupData = startingCardDataInDrawPile[i];
				var cardInGame = cardsInDrawPile[i];
				expect(cardSetupData.index).to.equal(cardInGame.getIndex());
			}
		});

		it('expect player setup data starting hand to match hand', function() {
			var gameSetupData = SDK.GameSession.getInstance().getGameSetupData();
			var playerSetupData = gameSetupData.players[0];
			var startingCardDataInDrawPile = playerSetupData.startingHand;
			var cardsInHand = SDK.GameSession.getInstance().getPlayer1().getDeck().getCardsInHand();
			for (var i = 0, il = startingCardDataInDrawPile.length; i < il; i++) {
				var cardSetupData = startingCardDataInDrawPile[i];
				var cardInGame = cardsInHand[i];
				if (cardSetupData != null) {
					expect(cardSetupData.index).to.equal(cardInGame.getIndex());
				} else {
					expect(cardInGame).to.not.exist;
				}
			}
		});

		it("expect hand to have " + CONFIG.MAX_HAND_SIZE + " slots", function() {
			expect(SDK.GameSession.getInstance().getPlayer1().getDeck().getHand().length).to.equal(CONFIG.MAX_HAND_SIZE);
		});

		it("expect " + CONFIG.STARTING_HAND_SIZE + " cards in hand", function() {
			var drawPile = SDK.GameSession.getInstance().getPlayer1().getDeck().getHand();
			var numCards = 0;
			for (var i = 0, il = drawPile.length; i < il; i++) {
				var cardIndex = drawPile[i];
				if (cardIndex != null) {
					numCards++;
				}
			}
			expect(numCards).to.equal(CONFIG.STARTING_HAND_SIZE);
		});

		it("expect deck card indices to map to indexed cards", function() {
			var drawPile = SDK.GameSession.getInstance().getPlayer1().getDeck().getDrawPile();
			var pass = true;
			for (var i = 0, il = drawPile.length; i < il; i++) {
				var cardIndex = drawPile[i];
				var card = SDK.GameSession.getInstance().getCardByIndex(cardIndex);
				if (card == null || card.getIndex() != cardIndex) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect deck cards to be in deck", function() {
			var cards = SDK.GameSession.getInstance().getPlayer1().getDeck().getCardsInDrawPile();
			var pass = true;
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				if (!card.getIsLocatedInDeck() || card.getIsLocatedInHand() || card.getIsActive()) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect hand card indices to map to indexed cards", function() {
			var drawPile = SDK.GameSession.getInstance().getPlayer1().getDeck().getHand();
			var pass = true;
			for (var i = 0, il = drawPile.length; i < il; i++) {
				var cardIndex = drawPile[i];
				if (cardIndex != null) {
					var card = SDK.GameSession.getInstance().getCardByIndex(cardIndex);
					if (card == null || card.getIndex() != cardIndex) {
						pass = false;
						break;
					}
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect hand cards to be in hand", function() {
			var cards = SDK.GameSession.getInstance().getPlayer1().getDeck().getCardsInHand();
			var pass = true;
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				if (card != null && (!card.getIsLocatedInHand() || card.getIsLocatedInDeck() || card.getIsActive())) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

	});

	describe("player 2", function() {

		it('expect general to be songhai', function() {
			expect(SDK.GameSession.getInstance().getGeneralForPlayer2().getFactionId()).to.equal(SDK.Factions.Faction2);
		});

		it('expect player setup data deck count to match card count from draw pile + hand + board', function() {
			var gameSetupData = SDK.GameSession.getInstance().getGameSetupData();
			var playerSetupData = gameSetupData.players[1];
			var generalCount = SDK.GameSession.getInstance().getGeneralForPlayer2() != null ? 1 : 0;
			var handCount = SDK.GameSession.getInstance().getPlayer2().getDeck().getHandExcludingMissing().length;
			var drawPileCount = SDK.GameSession.getInstance().getPlayer2().getDeck().getDrawPileExcludingMissing().length;
			expect(playerSetupData.deck.length).to.equal(generalCount + handCount + drawPileCount);
		});

		it('expect player setup data starting draw pile to match draw pile', function() {
			var gameSetupData = SDK.GameSession.getInstance().getGameSetupData();
			var playerSetupData = gameSetupData.players[1];
			var startingCardDataInDrawPile = playerSetupData.startingDrawPile;
			var cardsInDrawPile = SDK.GameSession.getInstance().getPlayer2().getDeck().getCardsInDrawPile();
			for (var i = 0, il = startingCardDataInDrawPile.length; i < il; i++) {
				var cardSetupData = startingCardDataInDrawPile[i];
				var cardInGame = cardsInDrawPile[i];
				expect(cardSetupData.index).to.equal(cardInGame.getIndex());
			}
		});

		it('expect player setup data starting hand to match hand', function() {
			var gameSetupData = SDK.GameSession.getInstance().getGameSetupData();
			var playerSetupData = gameSetupData.players[1];
			var startingCardDataInDrawPile = playerSetupData.startingHand;
			var cardsInHand = SDK.GameSession.getInstance().getPlayer2().getDeck().getCardsInHand();
			for (var i = 0, il = startingCardDataInDrawPile.length; i < il; i++) {
				var cardSetupData = startingCardDataInDrawPile[i];
				var cardInGame = cardsInHand[i];
				if (cardSetupData != null) {
					expect(cardSetupData.index).to.equal(cardInGame.getIndex());
				} else {
					expect(cardInGame).to.not.exist;
				}
			}
		});

		it("expect hand to have " + CONFIG.MAX_HAND_SIZE + " slots", function() {
			expect(SDK.GameSession.getInstance().getPlayer2().getDeck().getHand().length).to.equal(CONFIG.MAX_HAND_SIZE);
		});

		it("expect " + CONFIG.STARTING_HAND_SIZE + " cards in hand", function() {
			var drawPile = SDK.GameSession.getInstance().getPlayer2().getDeck().getHand();
			var numCards = 0;
			for (var i = 0, il = drawPile.length; i < il; i++) {
				var cardIndex = drawPile[i];
				if (cardIndex != null) {
					numCards++;
				}
			}
			expect(numCards).to.equal(CONFIG.STARTING_HAND_SIZE);
		});

		it("expect deck card indices to map to indexed cards", function() {
			var drawPile = SDK.GameSession.getInstance().getPlayer2().getDeck().getDrawPile();
			var pass = true;
			for (var i = 0, il = drawPile.length; i < il; i++) {
				var cardIndex = drawPile[i];
				var card = SDK.GameSession.getInstance().getCardByIndex(cardIndex);
				if (card == null || card.getIndex() != cardIndex) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect deck cards to be in deck", function() {
			var cards = SDK.GameSession.getInstance().getPlayer2().getDeck().getCardsInDrawPile();
			var pass = true;
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				if (!card.getIsLocatedInDeck() || card.getIsLocatedInHand() || card.getIsActive()) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect hand card indices to map to indexed cards", function() {
			var drawPile = SDK.GameSession.getInstance().getPlayer2().getDeck().getHand();
			var pass = true;
			for (var i = 0, il = drawPile.length; i < il; i++) {
				var cardIndex = drawPile[i];
				if (cardIndex != null) {
					var card = SDK.GameSession.getInstance().getCardByIndex(cardIndex);
					if (card == null || card.getIndex() != cardIndex) {
						pass = false;
						break;
					}
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect hand cards to be in hand", function() {
			var cards = SDK.GameSession.getInstance().getPlayer2().getDeck().getCardsInHand();
			var pass = true;
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				if (card != null && (!card.getIsLocatedInHand() || card.getIsLocatedInDeck() || card.getIsActive())) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

	});

	describe("board", function() {

		it("expect cards on board to be active", function() {
			var cards = SDK.GameSession.getInstance().getBoard().getCards(null, true);
			var pass = true;
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				if (!card.getIsActive() || card.getIsLocatedInHand() || card.getIsLocatedInDeck()) {
					pass = false;
					break;
				}
			}
			expect(pass).to.equal(true);
		});

		it("expect 2 active generals", function() {
			var cards = SDK.GameSession.getInstance().getBoard().getCards();
			var numGenerals = 0;
			for (var i = 0, il = cards.length; i < il; i++) {
				var card = cards[i];
				if (card instanceof SDK.Unit && card.getIsGeneral() && card.getIsActive()) {
					numGenerals++
				}
			}
			expect(numGenerals).to.equal(2);
		});

	});

});
