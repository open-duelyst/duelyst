const ModifierForcefieldAbsorb = require('app/sdk/modifiers/modifierForcefieldAbsorb');
const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');

/**
 * Returns the score for damage dealt to a unit.
 * @param {Unit} unit
 * @param {Number} damageAmount
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitDamage = function (unit, damageAmount) {
  // generic unit scores
  let score = 0;

  if (damageAmount > 0) {
    const scoreForUnit = ScoreForUnit(unit);
    const targetHasForcefield = unit.hasModifierClass(ModifierForcefieldAbsorb);

    // prefer to damage/kill high-value units
    if (targetHasForcefield) {
      score += BOUNTY.FORCEFIELD_POP + (scoreForUnit / 4); // flat bounty for popping a forcefield - amount of damage irrelevant plus softened unit score for sorting.
    } else {
      score += scoreForUnit * BOUNTY.DAMAGE_PER_UNIT_SCORE;
    }

    // prefer damage that may be lethal
    if (!targetHasForcefield) { // if unit has forcefield, impossible to have lethal damage
      const hp = unit.getHP();
      const remainingHP = hp - damageAmount;
      if (remainingHP <= 0) {
        score += scoreForUnit * BOUNTY.REMOVAL_PER_UNIT_SCORE;

        // prefer damage that is as close to exact lethal as possible - for every point of damage wasted, reduce score by 6, to a minimum of zero score
        score = Math.max(0, score - remainingHP * BOUNTY.REMOVAL_OVERKILL); // why do we have a floor of 0 here? scores should go negative if they're bad.
      }

      // general scoring
      if (unit.getIsGeneral()) {
        // slight bonus for damaging generals, scaling up logarithmically as general's hp declines
        score += Math.max(1.0, 25.0 / hp) * damageAmount * BOUNTY.DAMAGE_PER_GENERAL_HP; // again, why are we forcing a floor (of 1) here? the worst possible bonus here would be 1 dmg to a full-hp general for a bounty of 2. math.max does nothing here

        // huge bonus for killing general
        if (remainingHP <= 0) {
          score += BOUNTY.GENERAL_HP_WHEN_LETHAL;
        }
      }
    }
  }
  return score;
};

module.exports = ScoreForUnitDamage;
