const _ = require('underscore');
const GameSession = require('app/sdk/gameSession');
const CardIntent = require('../../card_intent/card_intent');
const CardIntentType = require('../../card_intent/card_intent_type');
const CardPhaseType = require('../../card_intent/card_phase_type');
const CardTargetType = require('../../card_intent/card_target_type');
const ScoreForIntentModifyHP = require('../intent/intent_modifyHP');
const ScoreForIntentModifyATK = require('../intent/intent_modifyATK');
const ScoreForIntentBurn = require('../intent/intent_burn');
const ScoreForIntentHeal = require('../intent/intent_heal');
const ScoreForIntentSummon = require('../intent/intent_summon');
const BOUNTY = require('../bounty');

/**
 * Returns the Phase Death score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForPhaseDeath = function (card, targetPosition, cardIntents) {
  let score = 0;
  const cardId = card.getBaseCardId();
  const gameSession = GameSession.getInstance();
  const board = gameSession.getBoard();
  const validIntents = cardIntents != null ? cardIntents : CardIntent.getIntentsByPartialPhaseType(cardId, CardPhaseType.Death);

  _.each(validIntents, (intent) => {
    let bonus = 0;

    // first we get a baseline score of what 1 creature dying would look like
    if (intent.type === CardIntentType.Burn) { bonus += ScoreForIntentBurn(card, targetPosition); } else if (intent.type === CardIntentType.Heal) { bonus += ScoreForIntentHeal(card, targetPosition); } else if (intent.type === CardIntentType.ModifyATK) { bonus += ScoreForIntentModifyATK(card, targetPosition); } else if (intent.type === CardIntentType.ModifyHP) { bonus += ScoreForIntentModifyHP(card, targetPosition); } else if (intent.type === CardIntentType.Summon) { bonus += ScoreForIntentSummon(card, targetPosition); }

    // second we grab all the minions on the board with 1 or 2 health (minions that could potentially die this turn)
    let lowHPMinions = 0;
    const unitsOnBoard = board.getUnits();

    for (let i = 0; i < unitsOnBoard.length; i++) {
      if (unitsOnBoard[i] != null && unitsOnBoard[i].getHP() < 3) {
        lowHPMinions++;
      }
    }

    // finally we multiply the score for a single unit dying by the number of low HP minions on the field and then tone down the score since not all minions will likely die this turn
    score += (bonus * lowHPMinions) * BOUNTY.LOW_HP_MINIONS;
  });

  return score;
};

module.exports = ScoreForPhaseDeath;
