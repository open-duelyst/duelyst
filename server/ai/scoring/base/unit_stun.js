const ModifierStunned = require('app/sdk/modifiers/modifierStunned');
const BOUNTY = require('../bounty');

/**
 * Returns the score for damage dealt to a unit.
 * @param {Unit} unit
 * @param {Number} damageAmount
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitStun = function (unit) {
  let score = 0;

  // don't stun generals or minions that are already stunned
  if (!unit.getIsGeneral() && !unit.hasActiveModifierClass(ModifierStunned)) {
    // prefer to stun high attack targets
    score += unit.getATK() * BOUNTY.STUN_PER_UNIT_ATK;
  }

  return score;
};

module.exports = ScoreForUnitStun;
