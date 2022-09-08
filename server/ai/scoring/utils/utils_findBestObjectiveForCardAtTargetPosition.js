const findNearestObjective = require('server/ai/scoring/utils/utils_findNearestObjective');
const findAttackObjectivesAndScoresForUnit = require('server/ai/scoring/utils/utils_findAttackObjectivesAndScoresForUnit');
const SDK = require('app/sdk');

const findBestObjectiveForCardAtTargetPosition = function (gameSession, card, targetPosition) {
  const unitToSend = card instanceof SDK.Spell ? gameSession.getGeneralForPlayerId(card.getOwnerId()) : card;
  const attackObjectivesAndScores = findAttackObjectivesAndScoresForUnit(gameSession, unitToSend, targetPosition);

  let objective;
  if (attackObjectivesAndScores.length === 0) {
    // use nearest if nothing in range
    const enemies = gameSession.getBoard().getEnemyEntitiesForEntity(unitToSend, SDK.CardType.Unit);
    objective = findNearestObjective(targetPosition, enemies);
  } else {
    // otherwise, take top of attack target list
    const objectiveAndScore = attackObjectivesAndScores[0];
    objective = objectiveAndScore.objective;
  }
  return objective;
};

module.exports = findBestObjectiveForCardAtTargetPosition;
