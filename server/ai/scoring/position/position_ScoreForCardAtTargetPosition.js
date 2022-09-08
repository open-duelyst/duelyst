// const position_proximityToEnemies = require("./position_proximityToEnemies");
// const position_proximityToGenerals = require("./position_proximityToGenerals");
const position_zeal = require('server/ai/scoring/position/position_zeal');
// const position_shadowTileAvoidance = require("./position_shadowTileAvoidance");
const position_seekManaGlobes = require('server/ai/scoring/position/position_seekManaGlobes');
const position_objective_backstab = require('server/ai/scoring/position/position_objective_backstab');
const position_objective_frenzy = require('server/ai/scoring/position/position_objective_frenzy');
const position_objective_provoke = require('server/ai/scoring/position/position_objective_provoke');
const position_objective_distanceFromBestObjective = require('server/ai/scoring/position/position_objective_distanceFromBestObjective');
const position_backstabAvoidance = require('server/ai/scoring/position/position_backstabAvoidance');
const findBestObjectiveForCardAtTargetPosition = require('server/ai/scoring/utils/utils_findBestObjectiveForCardAtTargetPosition');
const _ = require('underscore');
const Logger = require('app/common/logger');

const ScoreForCardAtTargetPosition = function (unit, positiontoEvaluate, bestObjective) {
  const gameSession = unit.getGameSession();
  if (typeof bestObjective === 'undefined' || unit === bestObjective) {
    bestObjective = findBestObjectiveForCardAtTargetPosition(gameSession, unit, positiontoEvaluate);
  }

  // USED BY PREPROCESSING TO EVALUATE MOVES, SUMMONS, and TELEPORT SPELLS
  // Reduced # of scoring modules compared to boardScore
  let score = 0;

  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 0 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate + " = " + score);
  // specific case positioning
  // score += scoreForUnit_module_proximityToEnemies(gameSession, unit, positiontoEvaluate);
  // score += scoreForUnit_module_proximityToGenerals(gameSession, unit, positiontoEvaluate);
  // score += scoreForUnit_module_avoidance_shadowTile(gameSession, unit, positiontoEvaluate);
  score += position_zeal(gameSession, unit, positiontoEvaluate);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 1 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);
  score += position_seekManaGlobes(gameSession, unit, positiontoEvaluate);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 2 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);
  score += position_objective_backstab(gameSession, unit, positiontoEvaluate, bestObjective);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 3 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);
  score += position_objective_frenzy(gameSession, unit, positiontoEvaluate, bestObjective);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 4 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);
  score += position_objective_provoke(gameSession, unit, positiontoEvaluate, bestObjective);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 5 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);
  score += position_objective_distanceFromBestObjective(gameSession, unit, positiontoEvaluate, bestObjective);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] 6 ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);
  score += position_backstabAvoidance(gameSession, unit, positiontoEvaluate, bestObjective);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] RETURN (7) ScoreForCardAtTargetPosition() => score for " + unit.getLogName() + " at " + positiontoEvaluate.x + "," + positiontoEvaluate.y + " = " + score);

  return score;
};

module.exports = ScoreForCardAtTargetPosition;
