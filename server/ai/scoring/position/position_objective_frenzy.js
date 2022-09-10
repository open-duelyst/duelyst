const BOUNTY = require('server/ai/scoring/bounty');
const _ = require('underscore');
const ModifierFrenzy = require('app/sdk/modifiers/modifierFrenzy');
const CardType = require('app/sdk/cards/cardType');
const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');

const position_objective_frenzy = function (gameSession, unit, position, bestObjective) {
  // rewards bounty for spaces adjacent to best target for each adjacent enemy unit
  // does not award bounty if space is not adjacent to bestObjective since we don't
  // want frenzy to override positioning logic for seeking best objective adjacency for attacks
  let score = 0;
  if (unit.hasModifierClass(ModifierFrenzy)) { // the more enemies nearby the better
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_frenzy() => unit " + unit.getLogName() + ". score = " + score);
    if (distanceBetweenBoardPositions(position, bestObjective.getPosition()) <= 1) {
      score += (_.reject(gameSession.getBoard().getCardsAroundPosition(position, CardType.Unit, 1), (card) => card.getIsSameTeamAs(unit)).length - 1) * BOUNTY.FRENZY_PER_UNIT; // minus 1 for objective itself. frenzy doesn't trigger on just 1 adjacent unit.
    }
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_frenzy() => unit " + unit.getLogName() + ". score = " + score);
  }

  return score;
};

module.exports = position_objective_frenzy;
