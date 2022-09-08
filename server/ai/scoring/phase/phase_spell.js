const Spell = require('app/sdk/spells/spell');
const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardPhaseType = require('../../card_intent/card_phase_type');
const BOUNTY = require('../bounty');
const ScoreForCard = require('../base/card');

/**
 * Returns the spell phase score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForPhaseSpell = function (card, targetPosition) {
  let score = 0;

  const cardId = card.getBaseCardId();
  const player = card.getOwner();
  const cardsInHand = [].concat(player.getDeck().getCardsInHand(), player.getCurrentSignatureCard());
  if (cardsInHand.length > 0) {
    const intents = CardIntent.getIntentsByPartialPhaseType(cardId, CardPhaseType.Spell);
    if (intents.length > 0) {
      // cache total score of all spells in hand
      let totalSpellScore = 0;
      let remainingManaAfterPlayingCard = Math.max(0, player.getRemainingMana() - card.getManaCost());
      for (let i = 0, il = cardsInHand.length; i < il; i++) {
        const cardInHand = cardsInHand[i];
        if (cardInHand instanceof Spell && cardInHand !== card) {
          totalSpellScore += BOUNTY.MODIFIER_SPELLWATCH;
          if (remainingManaAfterPlayingCard >= cardInHand.getManaCost()) {
            // add additional score when the card in hand could be played together with spell phase card
            totalSpellScore += BOUNTY.WATCH_WITH_TRIGGER;
            remainingManaAfterPlayingCard -= cardInHand.getManaCost();
          }
        }
      }

      // add total spell score once regardless of the number of spell phase intents
      score += totalSpellScore;
    }
  }

  return score;
};

module.exports = ScoreForPhaseSpell;
