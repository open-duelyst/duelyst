"use strict";

const BOUNTY = require("./../bounty");

/**
 * Returns the score for a spell.
 * @param {Spell} spell
 * @returns {Number}
 * @static
 */
let ScoreForSpell = function (spell) {
	// generic card score by mana cost
	return spell.getManaCost() * BOUNTY.MANA_COST;
};

module.exports = ScoreForSpell;
