const BOUNTY = require('server/ai/scoring/bounty');
const ModifierBackstab = require('app/sdk/modifiers/modifierBackstab');

const position_backstabAvoidance = function (gameSession, unit, position, bestObjective) {
  let score = 0;
  // if bestEnemyTarget is a backstabber, check if position is behind, if so penalize the position.
  // this should cause units who are able to attack their bestEnemyTarget from a non-behind position
  // to prefer to do so, all things being equal
  if (bestObjective.hasModifierClass(ModifierBackstab) && gameSession.getBoard().getIsPositionBehindEntity(bestObjective, position, 1, 0)) {
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_avoidance_backstab() => unit " + unit.getLogName() + ". score = " + score);
    score += BOUNTY.DISTANCE_FROM_BACKSTAB; // reused bounty for backstabber positioning penalty for distance from backstab position
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_avoidance_backstab() => unit " + unit.getLogName() + ". score = " + score);
  }
  return score;
};

module.exports = position_backstabAvoidance;
