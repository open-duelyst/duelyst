const BOUNTY = require('server/ai/scoring/bounty');
const getBountyForDistanceFromMyGeneral = require('server/ai/scoring/bounty_getBountyForDistanceFromGeneral');
const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');
const isUnitEvasive = require('server/ai/scoring/utils/utils_isUnitEvasive');

const position_proximityToGenerals = function (gameSession, unit, position) {
  // units want to be near opponent general
  // exponentially increasing desire to be near own general as hp declines
  let score = 0;
  const myPlayerId = unit.getOwnerId();
  if (!unit.getIsGeneral() && !isUnitEvasive(unit)) {
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_proximityToGenerals() => unit " + unit.getLogName() + ". score = " + score);
    const myGeneral = gameSession.getGeneralForPlayerId(myPlayerId);
    const opponentGeneral = gameSession.getGeneralForOpponentOfPlayerId(myPlayerId);
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_proximityToGenerals() => 1unit " + myGeneral.getLogName() + ". score = " + score + " pos = " + myGeneral.getPosition());
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_proximityToGenerals() => 2unit " + opponentGeneral.getLogName() + ". score = " + score + " pos = " + opponentGeneral.getPosition());
    score += distanceBetweenBoardPositions(position, myGeneral.getPosition()) * getBountyForDistanceFromMyGeneral(gameSession, myPlayerId);
    score += distanceBetweenBoardPositions(position, opponentGeneral.getPosition()) * BOUNTY.DISTANCE_FROM_OPPONENT_GENERAL;
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_proximityToGenerals() => unit " + unit.getLogName() + ". score = " + score);
  }

  return score;
};

module.exports = position_proximityToGenerals;
