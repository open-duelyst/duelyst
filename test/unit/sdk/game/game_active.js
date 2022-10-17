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

describe('game active', () => {
  beforeEach(() => {
    // setup test session
    UtilsSDK.setupSession(SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, 30), SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 30), true);
  });

  afterEach(() => {
    SDK.GameSession.reset();
  });

  it(`expect players to draw ${CONFIG.CARD_DRAW_PER_TURN} card at end of each turn`, () => {
    const gameSession = SDK.GameSession.getInstance();

    // end turns to draw cards
    for (let i = 0; i < 10; i++) {
      const currentPlayer = gameSession.getCurrentPlayer();
      const deck = currentPlayer.getDeck();
      const hand = deck.getHand();
      const numCardsInHand = deck.getNumCardsInHand();
      let numCardsRemainingInHand = numCardsInHand;

      // remove cards in hand until there is room to draw cards
      for (let j = CONFIG.MAX_HAND_SIZE - 1; j >= 0; j--) {
        if (numCardsRemainingInHand <= CONFIG.MAX_HAND_SIZE - CONFIG.CARD_DRAW_PER_TURN) {
          break;
        }

        const cardIndex = hand[j];
        if (cardIndex != null) {
          gameSession.removeCardByIndexFromHand(deck, cardIndex, gameSession.getCardByIndex(cardIndex));
          numCardsRemainingInHand--;
        }
      }

      // go to next turn
      gameSession.executeAction(gameSession.actionEndTurn());

      // current player should have more cards in hand
      expect(deck.getNumCardsInHand()).to.equal(numCardsRemainingInHand + CONFIG.CARD_DRAW_PER_TURN);
    }
  });

  it('expect players to activate signature cards on turns 3, 5, 7+', () => {
    const gameSession = SDK.GameSession.getInstance();

    // end turns to activate signature cards
    for (let i = 0; i < 16; i++) {
      if (i === 4 || i === 8 || i === 12 || i === 14) {
        // player 1 should have signature card on:
        // - game turn 4, 8, 12+
        // - player turn 3, 5, 7+
        expect(gameSession.getCurrentPlayer().getIsSignatureCardActive()).to.equal(true);
        expect(gameSession.getPlayer1().getIsSignatureCardActive()).to.equal(true);
        expect(gameSession.getPlayer2().getIsSignatureCardActive()).to.equal(false);

        // deactivate signature card for player 1
        gameSession.getPlayer1().setIsSignatureCardActive(false);
      } else if (i === 5 || i === 9 || i === 13 || i === 15) {
        // player 2 should have signature card on:
        // - game turn 5, 9, 13+
        // - player turn 3, 5, 7+
        expect(gameSession.getCurrentPlayer().getIsSignatureCardActive()).to.equal(true);
        expect(gameSession.getPlayer1().getIsSignatureCardActive()).to.equal(false);
        expect(gameSession.getPlayer2().getIsSignatureCardActive()).to.equal(true);

        // deactivate signature card for player 2
        gameSession.getPlayer2().setIsSignatureCardActive(false);
      } else {
        expect(gameSession.getPlayer1().getIsSignatureCardActive()).to.equal(false);
        expect(gameSession.getPlayer2().getIsSignatureCardActive()).to.equal(false);
      }

      // go to next turn
      gameSession.executeAction(gameSession.actionEndTurn());
    }
  });
});
