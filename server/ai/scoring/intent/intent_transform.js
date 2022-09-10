const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitTransform = require('../base/unit_transform');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForTransformFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  let transformCard = null;
  if (intent.cardId != null) {
    transformCard = card.getGameSession().getExistingCardFromIndexOrCreateCardFromData({ id: intent.cardId });
  }

  if (transformCard != null) {
    // the transformed card belongs to the owner the target card
    transformCard.setOwnerId(targetCard.getOwnerId());
  }

  if (targetCard != null && transformCard != null) {
    if (card.getIsSameTeamAs(targetCard)) {
      // casting a transform on a friendly target adds score
      score += ScoreForUnitTransform(targetCard, transformCard);
    } else {
      // subtract score for transforming enemy cards
      score -= ScoreForUnitTransform(targetCard, transformCard);
    }
  }

  return score;
};

/**
 * Returns the Transform score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentTransform = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Transform) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Transform);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForTransformFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentTransform;
