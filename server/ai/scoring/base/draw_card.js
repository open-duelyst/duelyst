const CONFIG = require('app/common/config');
const BOUNTY = require('../bounty');
// const ScoreForUnit = require("./unit");

/**
* Returns the score for removing a unit.
* @param {Unit} unit
* @returns {Number}
* @static
* @public
*/
const ScoreForDraw = function (card, targetCard, amount) {
  let score = 0;

  let numberOfCardsInHand = targetCard.getOwner().getDeck().getNumCardsInHand();
  const numberOfCardsInDeck = targetCard.getOwner().getDeck().getNumCardsInDrawPile();
  const maxHandSize = CONFIG.MAX_HAND_SIZE;
  let maxPotentialDraw = Math.min(numberOfCardsInDeck, maxHandSize - numberOfCardsInHand);
  let cardsToDraw = amount;
  // console.log("score: ", score);
  // points for each card you will draw.  more points given the lower amount of cards you have
  while (cardsToDraw > 0 && maxPotentialDraw > 0) {
    score += (BOUNTY.DRAW_SUCCESS / numberOfCardsInHand);
    numberOfCardsInHand++;
    maxPotentialDraw--;
    cardsToDraw--;
  }
  // remove points for each wasted card draw
  while (cardsToDraw > 0 && maxPotentialDraw == 0) {
    score += BOUNTY.DRAW_FAIL;
    cardsToDraw--;
  }

  return score;
};

module.exports = ScoreForDraw;
