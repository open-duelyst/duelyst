const SDK = require('app/sdk');
const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForUnitSummon = require('../base/unit_summon');
const THRESHOLD = require('../threshold');

/**
 * Returns the score for a unit at target position
 * @param {Card} card
 * @param {Object} intent
 * @param {Vec2} targetPosition
 * @returns {Number}
 * @static
 * @public
 */
const getScoreForSummonFromCardWithIntent = function (card, intent, targetPosition) {
  let score = 0;
  if (targetPosition != null) {
    const amount = intent.amount || 1;
    let summonedCards;
    if (intent.cardId != null) {
      summonedCards = [card.getGameSession().getExistingCardFromIndexOrCreateCardFromData({ id: intent.cardId })];
    } else if (intent.targets != null) {
      summonedCards = CardIntent.getCardsTargetedByCardWithIntent(card, intent, targetPosition);
    }

    if (summonedCards != null) {
      for (let i = 0, il = summonedCards.length; i < il; i++) {
        const summonedCard = summonedCards[i];

        // there shouldn't be any summon intents that summon a card for the enemy player
        // so set the owner to the player who plays the card
        summonedCard.setOwnerId(card.getOwnerId());

        // score summoning card
        let summonedCardScore = ScoreForUnitSummon(summonedCard, targetPosition) * amount;
        if (summonedCardScore < THRESHOLD.PLAY_CARD) {
          summonedCardScore += THRESHOLD.PLAY_CARD;
        }

        score += summonedCardScore;
      }
    }
  }

  return score;
};

/**
 * Returns the Summon score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForIntentSummon = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();

  if (card instanceof SDK.Unit) {
    score += ScoreForUnitSummon(card, targetPosition);
    if (score < THRESHOLD.PLAY_CARD) {
      score += THRESHOLD.PLAY_CARD;
    }
  }

  const validIntents = cardIntents != null ? CardIntent.filterIntentsByIntentType(cardIntents, CardIntentType.Summon) : CardIntent.getIntentsByIntentType(cardId, CardIntentType.Summon);
  _.each(validIntents, (intent) => {
    score += getScoreForSummonFromCardWithIntent(card, intent, targetPosition);
  });
  // a 1/1 unit is only going to have a summon score of 3 or 5 points,
  // well below the "useThreshold" of 15, which is really only appropriate for spells.
  // here we set a floor of 15 for all summon intents. The only way this will dip below the "useThreshold" of 15
  // is if it is a combo spell with another component scored NEGATIVELY (not just lowly, but in the negatives!)
  // there is such a thing as bad summons, like summoning a heartseeker near enemies...but as-is we always summon.
  return score;
};

module.exports = ScoreForIntentSummon;
