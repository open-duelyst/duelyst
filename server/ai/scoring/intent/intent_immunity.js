const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const CardImmunity = require('../../card_intent/card_immunity');
const ScoreForImmunity = require('../base/unit_immunity');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForImmunityFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    const immunity = intent.immunity || 0;
    if (card.getIsSameTeamAs(targetCard)) {
      // add score for own units gaining immunity
      score += ScoreForImmunity(card, targetCard, immunity);
    } else {
      // subtract score for enemy gaining immunity
      score -= ScoreForImmunity(card, targetCard, immunity);
    }
  }
  return score;
};

/**
 * Returns the modify mana score for cards in hand
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentImmunity = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Immunity) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Immunity);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForImmunityFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentImmunity;
