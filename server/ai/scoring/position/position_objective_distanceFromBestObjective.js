const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');
const BOUNTY = require('server/ai/scoring/bounty');
const ModifierBlastAttack = require('app/sdk/modifiers/modifierBlastAttack');
const CONFIG = require('app/common/config');
const isUnitEvasive = require('server/ai/scoring/utils/utils_isUnitEvasive');
const Logger = require('app/common/logger');

/**
 * Returns a score for a unit's distance from their best objective.
 * @param {GameSession} gameSession
 * @param {Unit} unit
 * @param {Vec2} position
 * @param {Card} bestObjective
 * @param {Boolean} [scoringMode=false] whether in board scoring mode, which softens some penalties such as evasive units running away.
 * @returns {Number}
 */
const position_objective_distanceFromBestObjective = function (gameSession, unit, position, bestObjective, scoringMode) {
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] position_objective_distanceFromBestObjective() => score for " + unit.getLogName() + " at " + position.x + "," + position.y + " for best objective " + bestObjective.getLogName());
  const distanceFromBestEnemyTarget = distanceBetweenBoardPositions(position, bestObjective.getPosition());
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] position_objective_distanceFromBestObjective() => distanceFromBestEnemyTarget = " + distanceFromBestEnemyTarget);
  const isEvasive = isUnitEvasive(unit);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] position_objective_distanceFromBestObjective() => isEvasive = " + isEvasive);
  const bounty = isEvasive ? BOUNTY.DISTANCE_FROM_BEST_ENEMY_TARGET_EVASIVE : BOUNTY.DISTANCE_FROM_BEST_ENEMY_TARGET;
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] position_objective_distanceFromBestObjective() => bounty = " + bounty);
  const maxDistance = distanceBetweenBoardPositions({ x: 0, y: 0 }, { x: CONFIG.BOARDROW, y: CONFIG.BOARDCOL });
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] position_objective_distanceFromBestObjective() => maxDistance = " + maxDistance);
  let score = isEvasive ? (distanceFromBestEnemyTarget * bounty) - maxDistance : distanceFromBestEnemyTarget * bounty;
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 1 position_objective_distanceFromBestObjective() => score = " + score);
  if (unit.hasModifierClass(ModifierBlastAttack)) {
    const distanceFromBestEnemyTargetX = distanceBetweenBoardPositions({ x: position.x, y: bestObjective.getPosition().y }, bestObjective.getPosition());
    score += distanceFromBestEnemyTargetX * BOUNTY.DISTANCE_FROM_BEST_ENEMY_TARGET_BLASTATTACK_X_V2;
  }
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 2 position_objective_distanceFromBestObjective() => score = " + score);
  if (scoringMode && isEvasive) {
    // in scoring mode we soften distance scores for evasive units so that they are less-likely to distort sequence-selection in sequences where units trigger evasion
    score /= 3;
  }
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 3 position_objective_distanceFromBestObjective() => score = " + score);
  return score;
};

module.exports = position_objective_distanceFromBestObjective;
