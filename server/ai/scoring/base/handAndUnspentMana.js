const CONFIG = require('app/common/config');
const BOUNTY = require('../bounty');

const handAndUnspentMana = function (gameSession, playerId) {
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForHandAndUnspentMana() entered.");
  // Tie-breaking minor bounty rewarding players for having more cards in-hand (up to max. of 4)
  const myPlayer = gameSession.getPlayerById(playerId);
  let score = 0;
  // var opponentPlayer = gameSession.getOpponentPlayer();
  const myNumCardsInHand = myPlayer.getDeck().getNumCardsInHand();
  // var opponentNumCardsInHand = myPlayer.getDeck().getNumCardsInHand();
  // dont reward players for wasting end of turn draw [2 draws at time of writing this]
  const maximumCardsInHandForBounty = CONFIG.MAX_HAND_SIZE - CONFIG.CARD_DRAW_PER_TURN;
  score += myNumCardsInHand > maximumCardsInHandForBounty ? maximumCardsInHandForBounty * BOUNTY.CARDS_IN_HAND : myNumCardsInHand * BOUNTY.CARDS_IN_HAND;
  // score.opponent += opponentNumCardsInHand > maximumCardsInHandForBounty ? maximumCardsInHandForBounty * CARDS_IN_HAND : opponentNumCardsInHand * CARDS_IN_HAND;
  // unspent mana penalty - mostly unnecessary as better plays will yield better board states
  // but given two roughly equal board states, we prefer casting to not casting. might be unnecesarry.
  score += myPlayer.getRemainingMana() * BOUNTY.UNSPENT_MANA;
  // score.my += opponentPlayer.getRemainingMana() * UNSPENT_MANA;
  return score;
};

module.exports = handAndUnspentMana;
