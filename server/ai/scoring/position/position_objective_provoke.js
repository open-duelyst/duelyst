const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');
const BOUNTY = require('server/ai/scoring/bounty');
const _ = require('underscore');
const ModifierProvoke = require('app/sdk/modifiers/modifierProvoke');
const CardType = require('app/sdk/cards/cardType');

const position_objective_provoke = function (gameSession, unit, position, bestObjective) {
  let score = 0;
  if (unit.hasModifierClass(ModifierProvoke)) {
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_provoke() => unit " + unit.getLogName() + ". score = " + score);
    // the more enemies nearby the better
    const distanceFromBestEnemyTarget = distanceBetweenBoardPositions(position, bestObjective.getPosition());
    score += distanceFromBestEnemyTarget * BOUNTY.DISTANCE_FROM_PROVOKE;
    // more enemy units around this position the better
    const unitsAroundPosition = gameSession.getBoard().getCardsAroundPosition(position, CardType.Unit, 1);
    const enemyUnitsAroundPosition = _.reject(unitsAroundPosition, (card) => card.getIsSameTeamAs(unit));
    score += enemyUnitsAroundPosition.length * BOUNTY.PROVOKE_PER_UNIT;
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_provoke() => unit " + unit.getLogName() + ". score = " + score);
  }

  return score;
};

module.exports = position_objective_provoke;
