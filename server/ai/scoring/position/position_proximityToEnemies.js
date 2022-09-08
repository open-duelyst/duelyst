const BOUNTY = require('server/ai/scoring/bounty');
const _ = require('underscore');
const CardType = require('app/sdk/cards/cardType');
const isUnitEvasive = require('server/ai/scoring/utils/utils_isUnitEvasive');

const position_proximityToEnemies = function (gameSession, unit, position) {
  let score = 0;
  // high hp units prefer to be near more units, low hp units do not.
  if (!isUnitEvasive(unit)) {
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_proximityToEnemies() => unit " + unit.getLogName() + ". score = " + score);
    score += _.reject(gameSession.getBoard().getCardsAroundPosition(position, CardType.Unit, 1), (card) => card.getIsSameTeamAs(unit)).length * ((unit.getHP() < BOUNTY.HIGH_HP_THRESHOLD) ? BOUNTY.QUANTITY_SURROUNDING_ENEMIES_LOW_HP : BOUNTY.QUANTITY_SURROUNDING_ENEMIES_HIGH_HP);
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_proximityToEnemies() => unit " + unit.getLogName() + ". score = " + score);
  }

  return score;
};

module.exports = position_proximityToEnemies;
