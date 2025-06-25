const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');
const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('actions: hand', () => {
  beforeEach(() => {
    // get all cards
    const allCards = SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getIsGeneral(false).getCards();
    const cardsThatCost1 = _.filter(allCards, (card) => card.getManaCost() === 1
        && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1)
        && !card.getHasFollowups()
        && (card.modifiersContextObjects == null || card.modifiersContextObjects.length === 0));
    const cardsThatCost4Plus = _.filter(allCards, (card) => card.getManaCost() >= 4 && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1));
    const cardsWithAirdrop = _.filter(allCards, (card) => card.modifiersContextObjects != null
        && _.find(card.modifiersContextObjects, (contextObject) => contextObject.type === SDK.ModifierAirdrop.type) != null
        && !card.getHasFollowups()
        && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1));

    // define test decks
    const player1CardInDeck = cardsThatCost1.splice(Math.floor(Math.random() * cardsThatCost1.length), 1)[0];
    const player1Deck = [
      { id: SDK.Cards.Faction1.General },
      { id: player1CardInDeck.getId() },
      { id: player1CardInDeck.getId() },
      { id: player1CardInDeck.getId() },
      { id: _.sample(cardsWithAirdrop).getId() },
      { id: _.sample(cardsThatCost4Plus).getId() },
      { id: _.sample(cardsThatCost1).getId() },
    ];
    const player2Card = _.sample(cardsThatCost1);
    const player2Deck = [
      { id: SDK.Cards.Faction1.General },
      { id: player2Card.getId() },
      { id: player2Card.getId() },
      { id: player2Card.getId() },
      { id: player2Card.getId() },
      { id: player2Card.getId() },
      { id: player2Card.getId() },
    ];

    // setup test session
    UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect invalid play card action when targeting invalid location', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const cardsInHand = player.getDeck().getCardsInHand();
    let indexToPlay = -1;
    let cardToPlay = null;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.getManaCost() === 1) {
        cardToPlay = card;
        indexToPlay = i;
        break;
      }
    }
    const validTargetPositions = cardToPlay.getValidTargetPositions();
    const allBoardPositions = SDK.GameSession.getInstance().getBoard().getPositions();
    let invalidTargetPosition;
    for (let i = 0, il = allBoardPositions.length; i < il; i++) {
      const boardPosition = allBoardPositions[i];
      let positionIsValid = false;
      for (let j = 0, jl = validTargetPositions.length; j < jl; j++) {
        const validPosition = validTargetPositions[j];
        if (boardPosition.x === validPosition.x && boardPosition.y === validPosition.y) {
          positionIsValid = true;
          break;
        }
      }
      if (!positionIsValid) {
        invalidTargetPosition = boardPosition;
      }
    }
    const playCardFromHandAction = player.actionPlayCardFromHand(indexToPlay, invalidTargetPosition.x, invalidTargetPosition.y);
    SDK.GameSession.getInstance().executeAction(playCardFromHandAction);

    expect(playCardFromHandAction.getIsValid()).to.equal(false);
  });

  /* Test disabled: flaky
  it('expect invalid play card action if card costs too much mana', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const cardsInHand = player.getDeck().getCardsInHand();
    let indexToPlay = -1;
    let cardToPlay = null;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.getManaCost() > player.getRemainingMana()) {
        cardToPlay = card;
        indexToPlay = i;
        break;
      }
    }
    const validTargetPositions = cardToPlay.getValidTargetPositions();
    const validTargetPosition = _.sample(validTargetPositions);
    const playCardFromHandAction = player.actionPlayCardFromHand(indexToPlay, validTargetPosition.x, validTargetPosition.y);
    SDK.GameSession.getInstance().executeAction(playCardFromHandAction);

    expect(playCardFromHandAction.getIsValid()).to.equal(false);
  });
  */

  it('expect airdrop unit valid target position to be anywhere', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const cardsInHand = player.getDeck().getCardsInHand();
    let cardToPlay = null;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.hasModifierClass(SDK.ModifierAirdrop)) {
        cardToPlay = card;
        break;
      }
    }

    expect(cardToPlay.getCanBeAppliedAnywhere()).to.equal(true);
  });

  /* Test disabled: flaky
  it('expect replace card to find different card', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const cardsInHand = player.getDeck().getCardsInHand();
    let indexReplaced = -1;
    let cardReplaced = null;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.getManaCost() > player.getRemainingMana()) {
        cardReplaced = card;
        indexReplaced = i;
        break;
      }
    }
    const replaceCardFromHandAction = player.actionReplaceCardFromHand(indexReplaced);
    SDK.GameSession.getInstance().executeAction(replaceCardFromHandAction);

    expect(SDK.GameSession.getInstance().getPlayer1().getDeck().getCardIndexInHandAtIndex(indexReplaced)).to.not.equal(cardReplaced.getIndex());
  });
  */

  it('expect invalid replace card action after already replaced a card', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const cardsInHand = player.getDeck().getCardsInHand();
    let indexReplaced = -1;
    let cardReplaced = null;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.getManaCost() > player.getRemainingMana()) {
        cardReplaced = card;
        indexReplaced = i;
        break;
      }
    }
    const replaceCardFromHandActionValid = player.actionReplaceCardFromHand(indexReplaced);
    SDK.GameSession.getInstance().executeAction(replaceCardFromHandActionValid);

    const hand = player.getDeck().getHand();
    let indexToReplace = -1;
    for (let i = 0, il = hand.length; i < il; i++) {
      const cardIndex = hand[i];
      if (cardIndex != null) {
        indexToReplace = i;
        break;
      }
    }
    const replaceCardFromHandActionInvalid = player.actionReplaceCardFromHand(indexToReplace);
    SDK.GameSession.getInstance().executeAction(replaceCardFromHandActionInvalid);

    expect(replaceCardFromHandActionInvalid.getIsValid()).to.equal(false);
  });

  it('expect hand slot be empty after playing a card', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const cardsInHand = player.getDeck().getCardsInHand();
    let indexToPlay = -1;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.getManaCost() === 1) {
        indexToPlay = i;
        break;
      }
    }
    const general = SDK.GameSession.getInstance().getGeneralForPlayerId(player.getPlayerId());
    const generalPosition = general.getPosition();
    const playCardFromHandAction = player.actionPlayCardFromHand(indexToPlay, generalPosition.x + 1, generalPosition.y);
    SDK.GameSession.getInstance().executeAction(playCardFromHandAction);

    expect(player.getDeck().getHand()[indexToPlay]).to.equal(null);
  });
});
