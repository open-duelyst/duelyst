const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitRemove = require('../base/unit_remove');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForRemoveFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    if (!card.getIsSameTeamAs(targetCard)) {
      // add score for removed enemy card
      score += ScoreForUnitRemove(targetCard);
    } else {
      // subtract score for removed friendly card
      // removing own units isn't as significant and removing enemy units <- possibly wrong.
      score -= ScoreForUnitRemove(targetCard);// * 0.75;
    }
  }
  return score;
};

/**
 * Returns the remove score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentRemove = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Remove) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Remove);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForRemoveFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentRemove;
