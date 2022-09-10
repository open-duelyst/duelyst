const CONFIG = require('app/common/config');
const BOUNTY = require('../bounty');
const ScoreForUnit = require('./unit');
const CardImmunity = require('../../card_intent/card_immunity');

/**
* Returns the score for removing a unit.
* @param {Unit} unit
* @returns {Number}
* @static
* @public
*/
const ScoreForImmunity = function (card, targetCard, immunity) {
  let score = 0;
  const gameSession = card.getGameSession();

  if (immunity == CardImmunity.Spells) {
    const enemyPlayer = gameSession.getOpponentPlayerOfPlayerId(targetCard.getOwner().playerId);
    const numberOfCardsInHand = enemyPlayer.getDeck().getNumCardsInHand();
    const potentialSpellImmunity = numberOfCardsInHand / 2; // assume  alf the cards in hand are spells

    // higher score the more cards in enemy hand and the stronger the unit you're buffing is
    score += (ScoreForUnit(targetCard) * potentialSpellImmunity) * BOUNTY.IMMUNITY_SPELLS;
  }

  if (immunity == CardImmunity.DamagingGenerals) {
    const opponentGeneral = gameSession.getGeneralForOpponentOfPlayerId(targetCard.getOwner().playerId);
    const enemyGeneralHP = opponentGeneral.getHP();

    // the closer you are to killing the enemy general, the more of a negative affect not being able to hurt the general is
    // 25 hp enemy general = -1.5
    // 5 hp enemy general = -7.5
    score += Math.max(1.0, 25.0 / enemyGeneralHP) * BOUNTY.IMMUNITY_DAMAGING_GENERALS;
  }

  // currently no other spell/follow-up grants immunity besides Aegis Barrier or Mark of Solitude so this can be expanded later

  return score;
};

module.exports = ScoreForImmunity;
