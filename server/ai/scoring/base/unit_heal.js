const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');

/**
 * Returns the score for healing to a unit.
 * @param {Unit} unit
 * @param {Number} healAmount
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitHeal = function (unit, healAmount) {
  // generic unit scores
  let score = 0;
  // console.log("unit: ", unit, "heal amount: ", healAmount);

  if (healAmount > 0) {
    const damageTaken = unit.getDamage();
    if (damageTaken > 0) {
      const hp = unit.getHP();
      const scoreForUnit = ScoreForUnit(unit);

      // prefer to heal high-value units
      score += scoreForUnit * BOUNTY.HEALING_PER_UNIT_SCORE;

      // prefer to heal damaged units
      if (unit.getIsGeneral()) {
        score += Math.max(1.0, 25 / hp) * (damageTaken * 0.5) * BOUNTY.HEALING_PER_GENERAL_DAMAGE;
      } else {
        score += Math.max(1.0, (unit.getMaxHP() * 0.5) / hp) * damageTaken * BOUNTY.HEALING_PER_UNIT_DAMAGE;
      }
    }

    // prefer healing that is close to exact as possible
    const overhealing = -Math.min(0, damageTaken - healAmount);
    score += overhealing * BOUNTY.HEALING_OVERHEAL;
  }

  return score;
};

module.exports = ScoreForUnitHeal;
