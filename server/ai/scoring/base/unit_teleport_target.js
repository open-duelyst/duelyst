const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const ScoreForCardAtTargetPosition = require('../position/position_ScoreForCardAtTargetPosition');

/**
 * Returns the score for TeleportTargeting a unit.
 *   Should select the best-positioned enemy unit or the worst-positioned friendly unit.
 *   Unit score is softened heavily to serve only as a tie-breaker for two similarly-positioned units
 *   Assumes that the current player is the casting player for purposes of determining if target is friendly
 *   Prefer to target refreshed friendly unit or units who are provoking refreshed friendly units? add bonus?
 *   Prefer to target enemy ranged units when we have lethal damage on said unit (or favorable trade)?
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForUnitTeleportTarget = function (card, targetPosition) {
  let score = 0;
  let positionScore = 0;
  const magicNumberTeleport = 4;
  /**
  MAGIC NUMBER 4
  why oh why do we add this to enemy positioning scores? well, to understand that, you need to know that,
  generally speaking, the "worst" positioning score is around -7, for an evasive unit in melee range of an
  enemy. This would be the juiciest target for a teleport spell, if friendly, so this tops the list. By
  adding 4 to enemy position scores, it means that a melee enemy in melee range (-0.5 score) would yield a
  teleport targeting score of around 4.3, or half the score of a friendly evasive unit in melee. This is
  about the same teleport score as a friendly unit with a positioning score of -4 (far away from any targets).
  Other positioning scoring modules can influence this, so an enemy provoker who is provoking a lot of units
  will score much higher due to the unit score and the positioning module for provoke. Same for a backstabber
  in position to backstab - and likewise for a friendly backstabber far away from backstab range.
  */
  const currentPlayerId = card.getGameSession().getCurrentPlayerId();
  const cardOwnerId = card.getOwnerId();
  // console.log("1 ScoreForUnitTeleportTarget -> score = " + score)
  score += (ScoreForUnit(card) / 10);
  // console.log("2 ScoreForUnitTeleportTarget -> score = " + score)
  // we soften unit scores by 10. The unit is important, but position is more important - this also normalizes the two scores
  // as positioning only ranges from -7 to -0.5 while unit scores can be much larger. Dividing by 10 places unit score
  // in an appropriate place relative to unit score
  positionScore = ScoreForCardAtTargetPosition(card, targetPosition, card);
  score += currentPlayerId == cardOwnerId ? positionScore * -1 : positionScore + magicNumberTeleport;
  // console.log("3 ScoreForUnitTeleportTarget -> score = " + score)

  return score;
};

module.exports = ScoreForUnitTeleportTarget;
