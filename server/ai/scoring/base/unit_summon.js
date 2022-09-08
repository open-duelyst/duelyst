const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const ScoreForCardAtTargetPosition = require('../position/position_ScoreForCardAtTargetPosition');

/**
 * Returns the score for summoning a unit.
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitSummon = function (summonedCard, targetPosition) {
  let score = 0;

  score += ScoreForUnit(summonedCard);
  // console.log("1 ScoreForUnitSummon = " + score)

  score += (ScoreForCardAtTargetPosition(summonedCard, targetPosition) / 5); // softened to not override value of unit, especially eg. 1/1
  // console.log("2 ScoreForUnitSummon = " + score)

  return score;
};

module.exports = ScoreForUnitSummon;
