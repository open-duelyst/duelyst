const Artifact = require('app/sdk/artifacts/artifact');
const Spell = require('app/sdk/spells/spell');
const CardIntent = require('server/ai/card_intent/card_intent');
const CardTargetType = require('server/ai/card_intent/card_target_type');
const _ = require('underscore');

/**
 * Returns whether a card plus optional card intents can be applied anywhere and still have the same effect.
 * @param {Card} card
 * @param {Array} [cardIntents=null]
 * @returns {Boolean}
 */
const canCardAndEffectsBeAppliedAnywhere = function (card, cardIntents) {
  if (card instanceof Artifact) return true;
  if (card instanceof Spell && card.getCanBeAppliedAnywhere()) {
    const cardId = card.getBaseCardId();
    if (cardIntents == null) {
      cardIntents = CardIntent.getIntentsByCardId(cardId, true);
    }
    if (cardIntents != null && cardIntents.length > 0) {
      const failingCardIntent = _.find(cardIntents, (intentObj) => {
        if (CardIntent.getPartialBitmaskMatch(intentObj.targets, CardTargetType.All.value)) {
          return false;
        } if (CardIntent.getPartialBitmaskMatch(intentObj.targets, CardTargetType.General.value)
          && !CardIntent.getPartialBitmaskMatch(intentObj.targets, CardTargetType.Minion.value)) {
          return false;
        }
        return true;
      });
      return failingCardIntent == null;
    }
  }
  return false;
};

module.exports = canCardAndEffectsBeAppliedAnywhere;
