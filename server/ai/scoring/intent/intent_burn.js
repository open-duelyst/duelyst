const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitDamage = require('../base/unit_damage');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForDamageFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    const amount = intent.amount || 0;
    if (!card.getIsSameTeamAs(targetCard)) {
      // add score for damaging enemy card
      score += ScoreForUnitDamage(targetCard, amount);
    } else {
      // subtract score for damaging friendly card
      // burning own units isn't as significant and burning enemy units
      score -= ScoreForUnitDamage(targetCard, amount) * 0.75;
    }
  }
  return score;
};

/**
 * Returns the burn score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentBurn = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();

  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Burn) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Burn);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForDamageFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentBurn;
