const CardIntent = require('server/ai/card_intent/card_intent');
const CardTargetType = require('server/ai/card_intent/card_target_type');
const CardIntentType = require('server/ai/card_intent/card_intent_type');
const _ = require('underscore');

/**
 * Returns whether or not a unit will survive any burn intents on a card.
 * @param {Unit} unit
 * @param {Card} card
 * @returns {Boolean}
 */
const willUnitSurviveCard = function (unit, card) {
  let unitSurvives = true;
  const gameSession = card.getGameSession();
  const myGeneral = gameSession.getGeneralForPlayerId(unit.getOwnerId());
  const cardId = card.getBaseCardId();
  const minionOrGeneralTargetType = unit.getIsGeneral() ? CardTargetType.General : CardTargetType.Minion;
  const friendlyOrEnemyTargetType = !myGeneral.getIsSameTeamAs(unit) ? CardTargetType.Enemy : CardTargetType.Friendly;
  const burnIntents = CardIntent.getIntentsByIntentTypeWithPartialTargetType(cardId, CardIntentType.Burn, minionOrGeneralTargetType | friendlyOrEnemyTargetType);
  if (burnIntents.length > 0) {
    const hp = unit.getHP();
    const lethalBurnIntentOnSelf = _.find(burnIntents, (intentObj) => intentObj.amount >= hp);
    unitSurvives = lethalBurnIntentOnSelf !== null;
  }
  return unitSurvives;
};

module.exports = willUnitSurviveCard;
