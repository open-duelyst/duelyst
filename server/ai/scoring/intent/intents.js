const ScoreForIntentBurn = require('./intent_burn');
const ScoreForIntentHeal = require('./intent_heal');
const ScoreForIntentStun = require('./intent_stun');
const ScoreForIntentModifyMana = require('./intent_modifymana');
const ScoreForIntentModifyHP = require('./intent_modifyHP');
const ScoreForIntentModifyATK = require('./intent_modifyATK');
const ScoreForIntentDispel = require('./intent_dispel');
const ScoreForIntentImmunity = require('./intent_immunity');
const ScoreForIntentRemove = require('./intent_remove');
const ScoreForIntentDraw = require('./intent_draw');
const ScoreForIntentRefresh = require('./intent_refresh');
const ScoreForIntentSummon = require('./intent_summon');
const ScoreForIntentTransform = require('./intent_transform');
const ScoreForIntentTeleportTarget = require('./intent_teleport_target');
const ScoreForIntentTeleportDestination = require('./intent_teleport_destination');
const ScoreForIntentApplyModifiers = require('./intent_apply_modifiers');
const ScoreForPhaseSpell = require('../phase/phase_spell');
const ScoreForPhaseDeath = require('../phase/phase_death');

/**
 * Returns the total intent score for a card at a target position.
 * @param {Card} card
 * @param {Vec2} targetPosition
 * @param {Array} [cardIntents=null] forced card intents (won't use card's own card intents)
 * @returns {Number}
 * @static
 * @public
 */
module.exports = function (card, targetPosition, cardIntents) {
  let score = 0;

  // score intents
  score += ScoreForIntentBurn(card, targetPosition, cardIntents);
  // console.log("score for burn: ", score);
  score += ScoreForIntentHeal(card, targetPosition, cardIntents);
  // console.log("score for heal: ", score);
  score += ScoreForIntentDispel(card, targetPosition, cardIntents);
  // console.log("score for dispel: ", score);
  score += ScoreForIntentStun(card, targetPosition, cardIntents);
  // console.log("score for stun: ", score);
  score += ScoreForIntentRemove(card, targetPosition, cardIntents);
  // console.log("score for remove: ", score);
  score += ScoreForIntentModifyMana(card, targetPosition, cardIntents);
  // console.log("score for modify mana: ", score);
  score += ScoreForIntentDraw(card, targetPosition, cardIntents);
  // console.log("score for draw: ", score);
  score += ScoreForIntentModifyHP(card, targetPosition, cardIntents);
  // console.log("score for modifyHP: ", score);
  score += ScoreForIntentModifyATK(card, targetPosition, cardIntents);
  // console.log("score for modifyATK: ", score);
  score += ScoreForIntentRefresh(card, targetPosition, cardIntents);
  // console.log("score for refresh: ", score);
  score += ScoreForIntentTransform(card, targetPosition, cardIntents);
  // console.log("score for transform: ", score);
  score += ScoreForIntentSummon(card, targetPosition, cardIntents);
  // console.log("score for summon: ", score);
  score += ScoreForIntentImmunity(card, targetPosition, cardIntents);
  // console.log("score for immunity: ", score);
  score += ScoreForIntentTeleportTarget(card, targetPosition, cardIntents);
  // console.log("score for teleport target: ", score);
  score += ScoreForIntentTeleportDestination(card, targetPosition, cardIntents);
  // console.log("score for teleport destination: ", score);
  score += ScoreForIntentApplyModifiers(card, targetPosition, cardIntents);

  // score phases
  score += ScoreForPhaseSpell(card, targetPosition, cardIntents);
  // console.log("score for phase spell: ", score);
  score += ScoreForPhaseDeath(card, targetPosition, cardIntents);
  // console.log("score for phase death: ", score);

  return score;
};
