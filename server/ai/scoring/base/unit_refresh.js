const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const ScoreForPosition = require('../position/position_ScoreForCardAtTargetPosition');

/**
 * Returns the score for Refreshing to a unit.
 * @param {Unit} unit
 * @param {Number} RefreshAmount
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitRefresh = function (unit) {
  let score = 0;

  if (unit.getIsExhausted() === true) { // only include score for units that are exhausted
    score += ScoreForUnit(unit) * BOUNTY.REFRESH_PER_UNIT_SCORE;
  }
  // score += ScoreForPosition(unit, unit.getPosition());

  return score;
};

module.exports = ScoreForUnitRefresh;
