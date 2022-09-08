const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForModifyMana = require('../base/modifymana');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForModifyManaFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    const amount = intent.amount || 0;
    if (card.getIsSameTeamAs(targetCard)) {
      // add score for modifying mana of friendly cards.
      score += ScoreForModifyMana(card, targetCard, amount);
    } else {
      // subtract score for modifying mana of enemy cards
      score -= ScoreForModifyMana(card, targetCard, amount);
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
const ScoreForIntentModifyMana = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.ManaCost) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.ManaCost);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForModifyManaFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentModifyMana;
