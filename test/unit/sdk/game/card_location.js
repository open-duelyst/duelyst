const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');
const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('cards: location', () => {
  beforeEach(() => {
    SDK.GameSession.reset();
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect card to be located in deck when applied and not when removed', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
    expect(card.getIsLocatedInDeck()).to.equal(true);
    SDK.GameSession.getInstance().removeCardByIndexFromDeck(deck, card.getIndex(), card);
    expect(card.getIsLocatedInDeck()).to.equal(false);
  });

  it('expect card to be located in hand when applied and not when removed', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
    expect(card.getIsLocatedInHand()).to.equal(true);
    SDK.GameSession.getInstance().removeCardByIndexFromHand(deck, card.getIndex(), card);
    expect(card.getIsLocatedInHand()).to.equal(false);
  });

  it('expect card to be located in signature cards when applied and not when removed', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    SDK.GameSession.getInstance().applyCardToSignatureCards(card, card.getIndex());
    expect(card.getIsLocatedInSignatureCards()).to.equal(true);
    SDK.GameSession.getInstance().removeCardFromSignatureCards(card);
    expect(card.getIsLocatedInSignatureCards()).to.equal(false);
  });

  it('expect card to be located on board when applied and not when removed', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
    expect(card.getIsLocatedOnBoard()).to.equal(true);
    SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
    expect(card.getIsLocatedOnBoard()).to.equal(false);
  });

  it('expect card to be played when applied and removed when removed', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
    expect(card.getIsPlayed()).to.equal(true);
    expect(card.getIsRemoved()).to.equal(false);
    SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
    expect(card.getIsPlayed()).to.equal(true);
    expect(card.getIsRemoved()).to.equal(true);
  });

  it('expect card moved from deck to hand to be only in hand', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
    expect(card.getIsLocatedInDeck()).to.equal(true);
    SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
    expect(card.getIsLocatedInDeck()).to.equal(false);
    expect(card.getIsLocatedInHand()).to.equal(true);
    SDK.GameSession.getInstance().removeCardByIndexFromHand(deck, card.getIndex(), card);
  });

  it('expect card moved from hand to deck to be only in deck', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
    expect(card.getIsLocatedInHand()).to.equal(true);
    SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
    expect(card.getIsLocatedInHand()).to.equal(false);
    expect(card.getIsLocatedInDeck()).to.equal(true);
    SDK.GameSession.getInstance().removeCardByIndexFromDeck(deck, card.getIndex(), card);
  });

  it('expect card moved from hand to board to be only on board', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
    expect(card.getIsLocatedInHand()).to.equal(true);
    SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
    expect(card.getIsLocatedInHand()).to.equal(false);
    expect(card.getIsLocatedOnBoard()).to.equal(true);
    SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
  });

  it('expect card moved from signature cards to board to be only on board', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    SDK.GameSession.getInstance().applyCardToSignatureCards(card, card.getIndex());
    expect(card.getIsLocatedInSignatureCards()).to.equal(true);
    SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
    expect(card.getIsLocatedInSignatureCards()).to.equal(false);
    expect(card.getIsLocatedOnBoard()).to.equal(true);
    SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
  });

  it('expect card moved from signature cards to hand to be only in hand', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToSignatureCards(card, card.getIndex());
    expect(card.getIsLocatedInSignatureCards()).to.equal(true);
    SDK.GameSession.getInstance().applyCardToHand(deck, card.getIndex(), card);
    expect(card.getIsLocatedInSignatureCards()).to.equal(false);
    expect(card.getIsLocatedInHand()).to.equal(true);
    SDK.GameSession.getInstance().removeCardByIndexFromHand(deck, card.getIndex(), card);
  });

  it('expect card moved from deck to board to be only on board', () => {
    const cardData = { id: SDK.Cards.Faction1.General };
    const card = SDK.GameSession.getInstance().getExistingCardFromIndexOrCreateCardFromData(cardData);
    const player = SDK.GameSession.getInstance().getPlayer1();
    card.setOwner(player);
    const deck = player.getDeck();
    SDK.GameSession.getInstance().applyCardToDeck(deck, card.getIndex(), card);
    expect(card.getIsLocatedInDeck()).to.equal(true);
    SDK.GameSession.getInstance().applyCardToBoard(card, 0, 0);
    expect(card.getIsLocatedInDeck()).to.equal(false);
    expect(card.getIsLocatedOnBoard()).to.equal(true);
    SDK.GameSession.getInstance().removeCardFromBoard(card, 0, 0);
  });
});
