const SDK = require('app/sdk.coffee');
const Entity = require('app/sdk/entities/entity');
const ModifierAirdrop = require('app/sdk/modifiers/modifierAirdrop');
const ModifierProvoked = require('app/sdk/modifiers/modifierProvoked');
const ModifierDyingWish = require('app/sdk/modifiers/modifierDyingWish');
const ModifierEphemeral = require('app/sdk/modifiers/modifierEphemeral');
const ModifierOpeningGambit = require('app/sdk/modifiers/modifierOpeningGambit');
const ModifierStunned = require('app/sdk/modifiers/modifierStunned');
const ModifierTransformed = require('app/sdk/modifiers/modifierTransformed');
const ModifierWall = require('app/sdk/modifiers/modifierWall');
const ModifierFirstBlood = require('app/sdk/modifiers/modifierFirstBlood');
const ModifierStrikeback = require('app/sdk/modifiers/modifierStrikeback');
const ModifierProvoke = require('app/sdk/modifiers/modifierProvoke');
const ModifierRanged = require('app/sdk/modifiers/modifierRanged');
const ModifierCelerity = require('app/sdk/modifiers/modifierTranscendance');
const ModifierBlastAttack = require('app/sdk/modifiers/modifierBlastAttack');
const ModifierDeathWatch = require('app/sdk/modifiers/modifierDeathWatch');
const ModifierDeathWatchSpawnEntity = require('app/sdk/modifiers/modifierDeathWatchSpawnEntity');
const ModifierSpellWatch = require('app/sdk/modifiers/modifierSpellWatch');
const ModifierGrow = require('app/sdk/modifiers/modifierGrow');
const ModifierFrenzy = require('app/sdk/modifiers/modifierFrenzy');
const ModifierBackstab = require('app/sdk/modifiers/modifierBackstab');
const ModifierHealWatchBuffSelf = require('app/sdk/modifiers/modifierHealWatchBuffSelf');
const ModifierHealWatch = require('app/sdk/modifiers/modifierHealWatch');
const ModifierRebirth = require('app/sdk/modifiers/modifierRebirth');
const ModifierFactory = require('app/sdk/modifiers/modifierFactory');
const ModifierFlying = require('app/sdk/modifiers/modifierFlying');
const ScoreForUnit = require('./unit');
const BOUNTY = require('../bounty');

/**
 * Returns the score for removing a unit.
 * @param {Card} card
 * @param {Card} targetCard
 * @param {Number} amount
 * @param {Boolean} [rebase=false]
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForApplyModifiers = function (card, targetCard, amount, modifierTypes) {
  let score = 0;
  let modifierScore = 0;
  // var gameSession = SDK.GameSession.getInstance();

  for (let i = 0; i < modifierTypes.length; i++) {
    const modifierType = modifierTypes[i];
    const modifier = ModifierFactory.modifierForType(modifierType, SDK.GameSession.create());
    if (modifier instanceof ModifierAirdrop) {
      modifierScore += BOUNTY.MODIFIER_AIRDROP;
    } else if (modifier instanceof ModifierProvoke) {
      modifierScore += BOUNTY.MODIFIER_PROVOKE;
    } else if (modifier instanceof ModifierFirstBlood) {
      modifierScore += BOUNTY.MODIFIER_RUSH;
    } else if (modifier instanceof ModifierRanged) {
      modifierScore += BOUNTY.MODIFIER_RANGED;
    } else if (modifier instanceof ModifierCelerity) {
      modifierScore += BOUNTY.MODIFIER_CELERITY;
    } else if (modifier instanceof ModifierBlastAttack) {
      modifierScore += BOUNTY.MODIFIER_BLAST;
    } else if (modifier instanceof ModifierDeathWatch) {
      modifierScore += BOUNTY.MODIFIER_DEATHWATCH;
    } else if (modifier instanceof ModifierGrow) {
      modifierScore += BOUNTY.MODIFIER_GROW;
    } else if (modifier instanceof ModifierBackstab) {
      modifierScore += BOUNTY.MODIFIER_BACKSTAB;
    } else if (modifier instanceof ModifierRebirth) {
      modifierScore += BOUNTY.MODIFIER_REBIRTH;
    } else if (modifier instanceof ModifierFlying) {
      modifierScore += BOUNTY.MODIFIER_FLYING;
    } else {
      modifierScore += BOUNTY.MODIFIER_GENERIC;
    }
    // etc
  }

  if (targetCard instanceof Entity) {
    score += (modifierScore * amount);
  }

  return score;
};

module.exports = ScoreForApplyModifiers;
