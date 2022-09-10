const BOUNTY = require('server/ai/scoring/bounty');
const ModifierBanding = require('app/sdk/modifiers/modifierBanding');
const arePositionsEqualOrAdjacent = require('server/ai/scoring/utils/utils_arePositionsEqualOrAdjacent');

/**
 * Should be used for scoring positions for purposes of summoning/moving/teleporting.
 * should not really be part of board scoring since zeal will proc whatever modifier
 * and be scored as part of the unit's scoring.
 * @param {GameSession} gameSession
 * @param {Unit} unit
 * @param {Vec2} position
 * @returns
 *
 */
const position_zeal = function (gameSession, unit, position) {
  let score = 0;
  if (unit.hasModifierClass(ModifierBanding)) { // bonus if adjacent to general
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_zeal() => unit " + unit.getLogName() + ". score = " + score);
    const general = gameSession.getGeneralForPlayerId(unit.getOwnerId());
    const generalPosition = general.getPosition();
    if (arePositionsEqualOrAdjacent(position, generalPosition)) {
      score += BOUNTY.ZEAL_ACTIVE;
    }
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_zeal() => unit " + unit.getLogName() + ". score = " + score);
  }

  return score;
};

module.exports = position_zeal;
