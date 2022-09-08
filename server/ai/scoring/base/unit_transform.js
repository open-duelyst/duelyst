const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');

/**
 * Returns the score for removing a unit.
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitTransform = function (unit, transformCard) {
  let score = 0;

  const scoreForUnit = ScoreForUnit(unit);
  const scoreForTransform = ScoreForUnit(transformCard);

  score += (scoreForTransform - scoreForUnit) * BOUNTY.UNIT_TRANSFORM; // the difference between what you're transforming it into vs what it is

  return score;
};

module.exports = ScoreForUnitTransform;
