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

describe('game mulligan', () => {
  beforeEach(() => {
    // get all cards
    const allCards = SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getIsGeneral(false).getCards();
    const cardsThatCost1 = _.filter(allCards, (card) => card.getManaCost() === 1
        && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1)
        && (card.modifiersContextObjects == null || card.modifiersContextObjects.length === 0));
    const cardsThatCost4Plus = _.filter(allCards, (card) => card.getManaCost() >= 4 && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1));

    // define test decks
    const playerDecks = [
      { id: SDK.Cards.Faction1.General },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost4Plus).getId() },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost1).getId() },
    ];

    // setup test session
    UtilsSDK.setupSession(playerDecks, playerDecks);
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect game to be new before both players have drawn starting hand', () => {
    expect(SDK.GameSession.getInstance().isNew()).to.equal(true);
  });

  it('expect player to have same starting hand after mulligan nothing', () => {
    const player = SDK.GameSession.getInstance().getPlayer1();
    const handBefore = player.getDeck().getHand().slice(0);
    const drawStartingHandAction = player.actionDrawStartingHand();
    SDK.GameSession.getInstance().executeAction(drawStartingHandAction);
    const handAfter = player.getDeck().getHand();
    let pass = true;
    for (let i = 0, il = handAfter.length; i < il; i++) {
      if (handAfter[i] !== handBefore[i]) {
        pass = false;
        break;
      }
    }

    expect(pass).to.equal(true);
  });

  it('expect invalid action when not draw starting hand during mulligan', () => {
    const player = SDK.GameSession.getInstance().getPlayer2();
    const cardsInHand = player.getDeck().getCardsInHand();
    let indexToPlay = -1;
    let cardToPlay = null;
    for (let i = 0, il = cardsInHand.length; i < il; i++) {
      const card = cardsInHand[i];
      if (card && card.getManaCost() <= player.getRemainingMana()) {
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

  /* Test disabled: flaky
  it('expect player to have different starting hand after mulligan something', () => {
    const player = SDK.GameSession.getInstance().getPlayer2();
    const handBefore = player.getDeck().getHand().slice(0);
    const indicesToMulligan = [];
    for (let i = 0, il = handBefore.length; i < il; i++) {
      const cardIndex = handBefore[i];
      if (cardIndex != null && indicesToMulligan.length < CONFIG.STARTING_HAND_REPLACE_COUNT) {
        indicesToMulligan.push(i);
      }
    }
    const drawStartingHandAction = player.actionDrawStartingHand(indicesToMulligan);
    SDK.GameSession.getInstance().executeAction(drawStartingHandAction);
    const handAfter = player.getDeck().getHand();
    let pass = false;
    for (let i = 0, il = handAfter.length; i < il; i++) {
      if (handAfter[i] !== handBefore[i]) {
        pass = true;
        break;
      }
    }

    expect(pass).to.equal(true);
  });
  */

  it('expect game to be active after both players have drawn starting hand', () => {
    SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getPlayer1().actionDrawStartingHand());
    SDK.GameSession.getInstance().executeAction(SDK.GameSession.getInstance().getPlayer2().actionDrawStartingHand());
    expect(SDK.GameSession.getInstance().isActive()).to.equal(true);
  });
});
