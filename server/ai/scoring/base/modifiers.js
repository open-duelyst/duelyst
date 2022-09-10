const CONFIG = require('app/common/config');
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
const ModifierFlying = require('app/sdk/modifiers/modifierFlying');
const ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');
const BOUNTY = require('../bounty');

/**
 * Returns whether a modifier is scored.
 * @param {Card} card
 * @param {Modifier} modifier
 * @returns {Boolean}
 * @private
 */
const getIsScoredModifierForCard = function (card, modifier) {
  let isScored = true;

  if (card.getIsActive()) {
    isScored = !(
      modifier instanceof ModifierOpeningGambit
      || modifier instanceof ModifierFirstBlood
    );
  }

  if (isScored) {
    isScored = !(
      modifier instanceof ModifierAirdrop
      || modifier instanceof ModifierProvoked
      || modifier instanceof ModifierDyingWish
      || modifier instanceof ModifierEphemeral
      || modifier instanceof ModifierStunned
      || modifier instanceof ModifierTransformed
      || modifier instanceof ModifierWall
      || modifier instanceof ModifierStrikeback
    );
  }

  return isScored;
};

/**
 * Returns score for a modifier attribute buff as applied to a card.
 * @param {Card} card
 * @param {Modifier} modifier
 * @param {String} buffKey
 * @param {Number} buffBounty
 * @param {Object} fixedAttributeBuffScores map of buff keys that are fixed with scores
 * @returns {Number}
 * @private
 */
const getAttributeScoreForModifierForCard = function (card, modifier, buffKey, buffBounty, fixedAttributeBuffScores) {
  let score = 0;

  if (modifier.getBuffsAttribute(buffKey)) {
    // don't consider modifiers that buff this attribute after encountering a fixed modifier
    const isFixed = modifier.getIsAttributeFixed(buffKey);
    const blockedByFixed = fixedAttributeBuffScores[buffKey] !== CONFIG.INFINITY;
    if (isFixed || blockedByFixed) {
      // find diff between buffed value and base value
      // we do this instead of a direct read on the attribute buffs
      // because some modifiers change attributes dynamically
      const baseValue = card[buffKey] || 0;
      const buffedValue = modifier.getBuffedAttribute(baseValue, buffKey) || 0;
      const buffAmount = buffedValue - baseValue;
      if (modifier.getRebasesAttribute(buffKey) || modifier.getBuffsAttributeAbsolutely(buffKey)) {
        // when rebasing attribute or setting absolutely, score by current buffed value
        score += buffedValue * buffBounty;
      } else {
        // score by buff amount
        score += buffAmount * buffBounty;
      }

      if (isFixed) {
        // store fixed score
        fixedAttributeBuffScores[buffKey] = score;

        // remove the score of the previous fixed modifier
        if (blockedByFixed) {
          score -= fixedAttributeBuffScores[buffKey];
        }
      }
    }
  }

  return score;
};

/**
 * Returns the score for the modifiers applied to a card.
 * @param {Card} card
 * @param {Boolean} [onlyRemovable=false] whether to only score removable/dispellable modifiers
 * @returns {Number}
 * @static
 * @public
 */
const ScoreForModifiers = function (card, onlyRemovable) {
  let score = 0;

  const modifiers = card.getModifiers();
  const fixedAttributeBuffScores = { atk: CONFIG.INFINITY, maxHP: CONFIG.INFINITY, manaCost: CONFIG.INFINITY }; // TODO: speed
  for (let i = 0, il = modifiers.length; i < il; i++) {
    const modifier = modifiers[i];
    if ((!onlyRemovable || modifier.getIsRemovable()) && getIsScoredModifierForCard(card, modifier)) {
      // generic modifier score
      score += BOUNTY.MODIFIER;

      // add scores for stat changes
      if (modifier.getBuffsAttributes()) {
        score += getAttributeScoreForModifierForCard(card, modifier, 'atk', BOUNTY.UNIT_ATK, fixedAttributeBuffScores);
        score += getAttributeScoreForModifierForCard(card, modifier, 'maxHP', BOUNTY.UNIT_HP, fixedAttributeBuffScores);
        score += getAttributeScoreForModifierForCard(card, modifier, 'manaCost', -BOUNTY.MANA_COST, fixedAttributeBuffScores);
      }

      // add score for artifact durability
      if (modifier.getIsFromArtifact()) {
        score += modifier.getDurability() * BOUNTY.ARTIFACT_DURABILITY; // for each artifact, add its durability to bounty
      }
    }
  }

  // add scores for specific modifiers
  // search through the card.hasModifierClass method
  // as it correctly checks for modifiers on cards that haven't been added to a game session
  // these cards don't have any modifiers but do have modifier context objects
  if (card.hasModifierClass(ModifierProvoke)) score += BOUNTY.MODIFIER_PROVOKE;
  else if (card.hasModifierClass(ModifierRanged)) score += BOUNTY.MODIFIER_RANGED;
  else if (card.hasModifierClass(ModifierBlastAttack)) score += BOUNTY.MODIFIER_BLAST;
  else if (card.hasModifierClass(ModifierDeathWatch)) {
    if (card.hasModifierClass(ModifierDeathWatchSpawnEntity)) score += BOUNTY.MODIFIER_DEATHWATCHSPAWNENTITY;
    else {
      score += BOUNTY.MODIFIER_DEATHWATCH;
    }
  } else if (card.hasModifierClass(ModifierSpellWatch)) score += BOUNTY.MODIFIER_SPELLWATCH;
  else if (card.hasModifierClass(ModifierGrow)) score += BOUNTY.MODIFIER_GROW;
  else if (card.hasModifierClass(ModifierFrenzy)) score += BOUNTY.MODIFIER_FRENZY;
  else if (card.hasModifierClass(ModifierCelerity)) score += BOUNTY.MODIFIER_CELERITY;
  else if (card.hasModifierClass(ModifierBackstab)) score += BOUNTY.MODIFIER_BACKSTAB;
  else if (card.hasModifierClass(ModifierRebirth)) score += BOUNTY.MODIFIER_REBIRTH;
  else if (card.hasModifierClass(ModifierFlying)) score += BOUNTY.MODIFIER_FLYING;
  else if (card.hasModifierClass(ModifierHealWatch)) {
    if (card.hasModifierClass(ModifierHealWatchBuffSelf)) score += BOUNTY.MODIFIER_HEALWATCHBUFFSELF;
    else {
      score += BOUNTY.MODIFIER_HEALWATCH;
    }
  } else if (card.hasModifierClass(ModifierForcefield)) score += BOUNTY.MODIFIER_FORCEFIELD;

  return score;
};

module.exports = ScoreForModifiers;
