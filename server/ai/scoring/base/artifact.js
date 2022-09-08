const BOUNTY = require('../bounty');

/**
 * Returns the score for an artifact.
 * @param {Artifact} artifact
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForArtifact = function (artifact) {
  // generic card score by mana cost
  return artifact.getManaCost() * BOUNTY.MANA_COST;
};

module.exports = ScoreForArtifact;
