const Unit = require('app/sdk/entities/unit');
const Spell = require('app/sdk/spells/spell');
const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitHeal = require('../base/unit_heal');

/**
 * Returns the score for the damage dealt to a target card by a card.
 * @param {Card} card
 * @param {Object} intent
 * @param {Card} targetCard
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForHealFromCardWithIntentToCard = function (card, intent, targetCard) {
  let score = 0;
  if (targetCard != null) {
    const amount = intent.amount || 0;
    if (card.getIsSameTeamAs(targetCard)) {
      // add score for healing friendly card
      score += ScoreForUnitHeal(targetCard, amount);
    } else {
      // subtract score for healing enemy card
      // healing on enemy isn't as significant as healing friendly
      if (ScoreForUnitHeal(targetCard, amount) > 0) {
        // In some cases the AI will try to use a sundrop elixir on a full health enemy unit because of the negative
        // overhealing score being subtracted from the "healing enemy" score creating a positive value.
        // this is a check to ensure that healing an enemy is ALWAYS a bad thing that should always return a negative score
        score -= ScoreForUnitHeal(targetCard, amount) * 0.5;
      } else {
        score += ScoreForUnitHeal(targetCard, amount) * 0.5;
      }
    }
  }

  return score;
};

/**
 * Returns the heal score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentHeal = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Heal) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Heal);

  _.each(validIntents, (intent) => {
    const cards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    for (let i = 0, il = cards.length; i < il; i++) {
      score += getScoreForHealFromCardWithIntentToCard(card, intent, cards[i]);
    }
  });

  return score;
};

module.exports = ScoreForIntentHeal;
