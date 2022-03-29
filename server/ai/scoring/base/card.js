"use strict";

const Entity = require("app/sdk/entities/entity");
const Spell = require("app/sdk/spells/spell");
const Artifact = require("app/sdk/artifacts/artifact");
const ScoreForUnit = require("./unit");
const ScoreForSpell = require("./spell");
const ScoreForArtifact = require("./artifact");

/**
 * Returns the score for a card.
 * @param {Card} card
 * @returns {Number}
 * @static
 * @public
 */
let ScoreForCard = function (card) {
	if (card instanceof Entity) {
		return ScoreForUnit(card);
	} else if (card instanceof Spell) {
		return ScoreForSpell(card);
	} else if (card instanceof Artifact) {
		return ScoreForArtifact(card);
	} else {
		return 0;
	}
};

module.exports = ScoreForCard;

