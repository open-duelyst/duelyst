const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const ScoreForModifiers = require('./modifiers');

/**
 * Returns the score for dispelling a unit.
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitDispel = function (unit) {
  // generic unit scores
  let score = 0;

  // get score for unit accounting for only removable modifiers
  // but don't dispel generals, as it is unlikely you would ever want to dispel a general
  if (!unit.getIsGeneral()) {
    score += ScoreForModifiers(unit, true) * BOUNTY.DISPEL_PER_UNIT_SCORE;
    score += ScoreForUnit(unit, true) * BOUNTY.UNIT_SCORE_TONED_DOWN;
  }
  // console.log("score for ", unit, " = ", score);

  return score;
};

module.exports = ScoreForUnitDispel;
