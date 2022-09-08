const ModifierOpeningGambit = require('app/sdk/modifiers/modifierOpeningGambit');
const ModifierDyingWish = require('app/sdk/modifiers/modifierDyingWish');

/**
 * Returns whether a unit is a buffer.
 * @param {Unit} unit
 * @returns {Boolean}
 */
const isUnitBuffer = function (unit) {
  const modifiers = unit.getModifiers();
  if (modifiers.length > 0) {
    for (let i = 0, il = modifiers.length; i < il; i++) {
      const modifier = modifiers[i];
      // in 99% of cases, a unit buffs self or others when:
      // 1. it is not an aura, opening gambit, or dying wish
      // 2. it has modifiersContextObjects
      if (!modifier.getIsAura() && !(modifier instanceof ModifierOpeningGambit || modifier instanceof ModifierDyingWish)) {
        const modifiersContextObjects = modifier.getModifiersContextObjects();
        if (modifiersContextObjects != null && modifiersContextObjects.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

module.exports = isUnitBuffer;
