const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitTeleportDestination = require('../base/unit_teleport_destination');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForTeleportDestinationFromCardWithIntentToCard = function (card, intent, targetPosition) {
  let score = 0;
  const teleportDestinationCard = intent.cardId || null;
  if (targetPosition != null && teleportDestinationCard != null) {
    score += ScoreForUnitTeleportDestination(targetPosition, teleportDestinationCard);
  }
  return score;
};

/**
 * Returns the TeleportDestination score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentTeleportDestination = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.TeleportDestination) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.TeleportDestination);

  _.each(validIntents, (intent) => {
    // let cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    // for (var i = 0, il = cards.length; i < il; i++) {
    score += getScoreForTeleportDestinationFromCardWithIntentToCard(card, intent, targetPosition);
    // }
  });

  return score;
};

module.exports = ScoreForIntentTeleportDestination;
