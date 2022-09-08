const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForApplyModifiers = require('../base/apply_modifiers');

/**
 * Returns the
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForApplyModifiersFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    const amount = intent.amount || 1;
    const { modifiers } = intent;
    if (card.getIsSameTeamAs(targetCard)) {
      // add score for applying modifiers to friendly cards
      score += ScoreForApplyModifiers(card, targetCard, amount, modifiers);
    } else {
      // subtract score for applying modifiers to enemy cards
      score -= ScoreForApplyModifiers(card, targetCard, amount, modifiers);
    }
  }
  return score;
};

/**
 * Returns the
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentApplyModifiers = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.ApplyModifiers) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.ApplyModifiers);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForApplyModifiersFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentApplyModifiers;
