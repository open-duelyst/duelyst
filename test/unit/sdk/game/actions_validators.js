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

describe('actions: validators', () => {
  beforeEach(() => {
    // get all cards
    const allCards = SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getIsGeneral(false).getCards();
    const cardsThatCost1 = _.filter(allCards, (card) => card.getManaCost() === 1
        && (card.getFactionId() === SDK.Factions.Neutral || card.getFactionId() === SDK.Factions.Faction1)
        && (card.modifiersContextObjects == null || card.modifiersContextObjects.length === 0));

    // define test decks
    const playerDecks = [
      { id: SDK.Cards.Faction1.General },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost1).getId() },
      { id: _.sample(cardsThatCost1).getId() },
    ];

    // setup test session
    UtilsSDK.setupSession(playerDecks, playerDecks, true);
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it('expect invalid action when not player\'s turn', () => {
    const player = SDK.GameSession.getInstance().getNonCurrentPlayer();
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
});
