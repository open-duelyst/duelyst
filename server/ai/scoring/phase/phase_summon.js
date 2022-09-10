const Unit = require('app/sdk/entities/unit');
const ModifierSummonWatch = require('app/sdk/modifiers/modifierSummonWatch');
const _ = require('underscore');
const CardIntent = require('../../card_intent/card_intent');
const CardPhaseType = require('../../card_intent/card_phase_type');
const BOUNTY = require('../bounty');

/**
 * Returns the summon phase score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForPhaseSummon = function (card, targetPosition) {
  let score = 0;

  const cardId = card.getBaseCardId();
  const player = card.getOwner();
  const cardsInHand = [].concat(player.getDeck().getCardsInHand(), player.getCurrentSignatureCard());
  if (cardsInHand.length > 0) {
    const intents = CardIntent.getIntentsByPartialPhaseType(cardId, CardPhaseType.Summon);
    if (intents.length > 0) {
      const modifierSummonWatchContextObjectOnCard = card.getContextObjectForModifierClass(ModifierSummonWatch);
      const modifierSummonWatchOnCard = card.getGameSession().getOrCreateModifierFromContextObjectOrIndexAndApplyContextObject(modifierSummonWatchContextObjectOnCard);
      let totalSummonScore = 0;
      let remainingManaAfterPlayingCard = Math.max(0, player.getRemainingMana() - card.getManaCost());
      for (let i = 0, il = cardsInHand.length; i < il; i++) {
        const cardInHand = cardsInHand[i];
        if (cardInHand instanceof Unit && cardInHand !== card && modifierSummonWatchOnCard.getIsCardRelevantToWatcher(cardInHand)) {
          totalSummonScore += BOUNTY.MODIFIER_SUMMONWATCH;
          if (remainingManaAfterPlayingCard >= cardInHand.getManaCost()) {
            // add additional score when the card in hand could be played together with spell phase card
            totalSummonScore += BOUNTY.WATCH_WITH_TRIGGER;
            remainingManaAfterPlayingCard -= cardInHand.getManaCost();
          }
        }
      }
      // add total summon score once regardless of the number of summon phase intents
      score += totalSummonScore;
    }
  }

  return score;
};

module.exports = ScoreForPhaseSummon;
