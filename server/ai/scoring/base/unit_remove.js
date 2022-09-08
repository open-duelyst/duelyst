const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');

/**
 * Returns the score for removing a unit.
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitRemove = function (unit) {
  let score = 0;

  const scoreForUnit = ScoreForUnit(unit);

  // prefer to kill high-value units
  // score += scoreForUnit * BOUNTY.DAMAGE_PER_UNIT_SCORE;  // <- not sure why this is included.  It makes the next line completely irrelevant.
  score += scoreForUnit * BOUNTY.REMOVAL_PER_UNIT_SCORE;

  return score;
};

module.exports = ScoreForUnitRemove;
