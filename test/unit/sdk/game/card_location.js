var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('../../../../app/common/config');
var Logger = require('../../../../app/common/logger');
var SDK = require('../../../../app/sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("cards: location", function() {

	beforeEach(function () {
		SDK.GameSession.reset();
	});

	afterEach(function () {
		SDK.GameSession.reset();
	});

	it("expect card to be located in deck when applied and not when removed", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
		expect(card.getIsLocatedInDeck()).to.equal(true);
		SDK.GameSession.getInstance().removeCardByIndexFromDeck(deck, card.getIndex(), card);
		expect(card.getIsLocatedInDeck()).to.equal(false);
	});

	it("expect card to be located in hand when applied and not when removed", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
		expect(card.getIsLocatedInHand()).to.equal(true);
		SDK.GameSession.getInstance().removeCardByIndexFromHand(deck, card.getIndex(), card);
		expect(card.getIsLocatedInHand()).to.equal(false);
	});

	it("expect card to be located in signature cards when applied and not when removed", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		SDK.GameSession.getInstance().applyCardToSignatureCards(card, card.getIndex());
		expect(card.getIsLocatedInSignatureCards()).to.equal(true);
		SDK.GameSession.getInstance().removeCardFromSignatureCards(card);
		expect(card.getIsLocatedInSignatureCards()).to.equal(false);
	});

	it("expect card to be located on board when applied and not when removed", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
		expect(card.getIsLocatedOnBoard()).to.equal(true);
		SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
		expect(card.getIsLocatedOnBoard()).to.equal(false);
	});

	it("expect card to be played when applied and removed when removed", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
		expect(card.getIsPlayed()).to.equal(true);
		expect(card.getIsRemoved()).to.equal(false);
		SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
		expect(card.getIsPlayed()).to.equal(true);
		expect(card.getIsRemoved()).to.equal(true);
	});

	it("expect card moved from deck to hand to be only in hand", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
		expect(card.getIsLocatedInDeck()).to.equal(true);
		SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
		expect(card.getIsLocatedInDeck()).to.equal(false);
		expect(card.getIsLocatedInHand()).to.equal(true);
		SDK.GameSession.getInstance().removeCardByIndexFromHand(deck, card.getIndex(), card);
	});

	it("expect card moved from hand to deck to be only in deck", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
		expect(card.getIsLocatedInHand()).to.equal(true);
		SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
		expect(card.getIsLocatedInHand()).to.equal(false);
		expect(card.getIsLocatedInDeck()).to.equal(true);
		SDK.GameSession.getInstance().removeCardByIndexFromDeck(deck, card.getIndex(), card);
	});

	it("expect card moved from hand to board to be only on board", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
		expect(card.getIsLocatedInHand()).to.equal(true);
		SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
		expect(card.getIsLocatedInHand()).to.equal(false);
		expect(card.getIsLocatedOnBoard()).to.equal(true);
		SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
	});

	it("expect card moved from signature cards to board to be only on board", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		SDK.GameSession.getInstance().applyCardToSignatureCards(card, card.getIndex());
		expect(card.getIsLocatedInSignatureCards()).to.equal(true);
		SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
		expect(card.getIsLocatedInSignatureCards()).to.equal(false);
		expect(card.getIsLocatedOnBoard()).to.equal(true);
		SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
	});

	it("expect card moved from signature cards to hand to be only in hand", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToSignatureCards(card, card.getIndex());
		expect(card.getIsLocatedInSignatureCards()).to.equal(true);
		SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
		expect(card.getIsLocatedInSignatureCards()).to.equal(false);
		expect(card.getIsLocatedInHand()).to.equal(true);
		SDK.GameSession.getInstance().removeCardByIndexFromHand(deck, card.getIndex(), card);
	});

	it("expect card moved from deck to board to be only on board", function() {
		var cardData = {id: SDK.Cards.Faction1.General};
		var card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
		var player = SDK.GameSession.getInstance().getPlayer1();
		card.setOwner(player);
		var deck = player.getDeck();
		SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
		expect(card.getIsLocatedInDeck()).to.equal(true);
		SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
		expect(card.getIsLocatedInDeck()).to.equal(false);
		expect(card.getIsLocatedOnBoard()).to.equal(true);
		SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
	});

});
