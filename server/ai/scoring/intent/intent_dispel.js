const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitDispel = require('../base/unit_dispel');
const willUnitSurviveCard = require('../utils/utils_willUnitSurviveCard');
const BOUNTY = require('../bounty');

/**
 * Returns the score for dispelling a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForDispelFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    // console.log(card, intent, targetCard);
    if (!card.getIsSameTeamAs(targetCard)) {
      // add score for dispeling enemy card
      score += ScoreForUnitDispel(targetCard);
    } else {
      // subtract score for dispeling friendly card
      score -= ScoreForUnitDispel(targetCard);
    }
  }
  return score;
};

/**
 * Returns the dispel score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentDispel = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Dispel) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Dispel);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      if (willUnitSurviveCard(cards[i], card)) {
        score += getScoreForDispelFromCardWithIntentToCard(card, intent, cards[i]);
      }
    }
    // score still zero? Wasted valid intent. penalize
    if (score == 0) {
      score += BOUNTY.DISPEL_WASTED; // -5
    }
  });

  return score;
};

module.exports = ScoreForIntentDispel;
