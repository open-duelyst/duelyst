const findNearestObjective = require('server/ai/scoring/utils/utils_findNearestObjective');
const distanceBetweenBoardPositions = require('server/ai/scoring/utils/utils_distanceBetweenBoardPositions');
const BOUNTY = require('server/ai/scoring/bounty');
const _ = require('underscore');
const SDK = require('app/sdk');

const position_seekManaGlobes = function (gameSession, unit, position) {
  let score = 0;
  // collect bounty for distance from nearest globe
  const manaGlobes = _.filter(gameSession.getBoard().getTiles(true), (tile) => tile.getBaseCardId() === SDK.Cards.Tile.BonusMana && !tile.getDepleted());
  if (manaGlobes.length > 0) {
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_seekManaGlobes() => unit " + unit.getLogName() + ". score = " + score);
    const nearestGlobe = findNearestObjective(position, manaGlobes);
    const distanceFromNearestGlobe = distanceBetweenBoardPositions(position, nearestGlobe.getPosition());
    score += distanceFromNearestGlobe * BOUNTY.DISTANCE_FROM_NEAREST_BONUS_MANA;
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_seekManaGlobes() => unit " + unit.getLogName() + "at position" + position.x + ", " + position.y + " score = " + score, "nearestGlobe", nearestGlobe.getLogName(), "of", manaGlobes.length);
  }

  return score;
};
module.exports = position_seekManaGlobes;
