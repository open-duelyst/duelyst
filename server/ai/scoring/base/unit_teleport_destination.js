const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const ScoreForCardAtTargetPosition = require('../position/position_ScoreForCardAtTargetPosition');

/**
 * Returns the score for TeleportDestinationing a unit.
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitTeleportDestination = function (targetPosition, teleportDestinationCard) {
  let score = 0;

  score += ScoreForUnit(teleportDestinationCard);
  score += ScoreForCardAtTargetPosition(teleportDestinationCard, targetPosition, teleportDestinationCard);

  return score;
};

module.exports = ScoreForUnitTeleportDestination;
