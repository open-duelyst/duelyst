const Entity = require('app/sdk/entities/entity');
const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');

/**
 * Returns the score for removing a unit.
 * @param {Card} card
 * @param {Card} targetCard
 * @param {Number} amount
 * @param {Boolean} [rebase=false]
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForModifyATK = function (card, targetCard, amount, rebase) {
  let score = 0;

  if (targetCard instanceof Entity) {
    const scoreForUnit = ScoreForUnit(targetCard);

    if (rebase) {
      score += (amount - targetCard.getATK()) * BOUNTY.UNIT_ATK;
    } else {
      score += ((scoreForUnit / 2) * amount) * BOUNTY.UNIT_ATK;
    }
    // console.log("ATK score for ", card.name, " is ", score);
  }

  return score;
};

module.exports = ScoreForModifyATK;
