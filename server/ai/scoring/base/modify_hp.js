const Entity = require('app/sdk/entities/entity');
const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const ScoreForRemove = require('./unit_remove');

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
const ScoreForModifyHP = function (card, targetCard, amount, rebase) {
  let score = 0;

  if (targetCard instanceof Entity) {
    if (!rebase) {
      if (targetCard.getHP() + amount <= 0) {
        score = ScoreForRemove(targetCard) * -1;
      }
    }

    if (rebase) {
      score += (amount - targetCard.getHP()) * BOUNTY.UNIT_HP;
    } else if (targetCard.getHP() + amount > 0) { // remove points for killing a unit
      const scoreForUnit = ScoreForUnit(targetCard);
      score += ((scoreForUnit / 2) * amount) * BOUNTY.UNIT_HP;
    }
  }

  return score;
};

module.exports = ScoreForModifyHP;
