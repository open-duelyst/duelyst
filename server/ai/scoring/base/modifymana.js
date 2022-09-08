const BOUNTY = require('../bounty');

/**
 * Returns the score for removing a unit.
 * @param {Unit} unit
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForModifyMana = function (card, targetCard, amount) {
  let score = 0;

  const currentPlayer = card.getOwner();
  const manaCost = targetCard.getManaCost();

  // amount = Math.max(0, manaCost + amount)
  if ((manaCost + amount) < 0) {
    amount = manaCost * -1; // if a card is lowered to below 0 mana, only count the amount of mana it's saving
  }

  // console.log(card.name, " + ", targetCard.name, " + ", amount, " = ...");
  score += (amount * BOUNTY.MANA_PER_SCORE) * -1;
  // if the card lowers mana by 1 then "-1" will be passed in.  -1 * 10 = -10 * -1 = 10 points assuming BOUNTY.MANA_PER_SCORE is 10
  // if the card increases mana by 1 then "1" will be passed in.  1 * 10 = 10 * -1 = -10 points assuming BOUNTY.MANA_PER_SCORE is 10

  if ((currentPlayer.getRemainingMana() - card.getManaCost()) > (manaCost + amount)) {
    score += BOUNTY.MANA_PER_SCORE;
  } // after the mana cost from the initial card is deducted, if the player has enough mana left over to cast the affected spell, add a bonus

  // console.log("score = ", score);
  return score;
};

module.exports = ScoreForModifyMana;
