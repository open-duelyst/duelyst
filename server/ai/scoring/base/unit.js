const BOUNTY = require('../bounty');
const ScoreForModifiers = require('./modifiers');

/**
 * Returns the score for a unit.
 * @param {Unit} unit
 * @param {Boolean} [onlyRemovableModifiers=false] whether to only score removable/dispellable modifiers
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnit = function (unit, onlyRemovableModifiers) {
  let score = 0;

  // add stats bounties
  if (unit.getIsGeneral()) {
    score += (unit.getHP() * BOUNTY.GENERAL_HP) + (unit.getATK() * BOUNTY.GENERAL_ATK);
  } else {
    score += (unit.getHP() * BOUNTY.UNIT_HP) + (unit.getATK() * BOUNTY.UNIT_ATK) ** 1.5; // test values here
  }

  // add modifier score
  score += ScoreForModifiers(unit, onlyRemovableModifiers);

  // when unit not played, add mana cost bounty
  if (!unit.getIsPlayed()) {
    score += unit.getManaCost() * BOUNTY.MANA_COST;
  }

  return score;
};

module.exports = ScoreForUnit;
