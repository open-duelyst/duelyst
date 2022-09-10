const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitTeleportTarget = require('../base/unit_teleport_target');

/**
 * Returns the score for selecting a card to be teleported
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForTeleportTargetFromCardWithIntentToCard = function (card, intent, targetPosition) {
  let score = 0;
  if (targetPosition != null) {
    const targetedUnit = card.getGameSession().getBoard().getUnitAtPosition(targetPosition);
    score += ScoreForUnitTeleportTarget(targetedUnit, targetPosition);
  }
  return score;
};

/**
 * Returns the TeleportTarget score for a card at a target position.
 *   Should select the best-positioned enemy unit or the worst-positioned friendly unit.
 *   Unit score is softened heavily to serve only as a tie-breaker for two similarly-positioned units
 *   Assumes that the current player is the casting player for purposes of determining if target is friendly
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentTeleportTarget = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.TeleportTarget) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.TeleportTarget);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForTeleportTargetFromCardWithIntentToCard(card, intent, targetPosition);
    }
  });

  return score;
};

module.exports = ScoreForIntentTeleportTarget;
