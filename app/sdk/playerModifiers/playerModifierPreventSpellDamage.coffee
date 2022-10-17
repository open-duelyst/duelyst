PlayerModifier = require './playerModifier'
ModifierImmuneToSpellDamage = require 'app/sdk/modifiers/modifierImmuneToSpellDamage'
CONFIG = require 'app/common/config'

class PlayerModifierPreventSpellDamage extends PlayerModifier

  type: "PlayerModifierPreventSpellDamage"
  @type: "PlayerModifierPreventSpellDamage"

  @modifierName: "Prevent Spell Damage"
  @description: "Prevents ALL damage from spells"

  maxStacks: 1

  isAura: true
  auraIncludeAlly: true
  auraIncludeBoard: true
  auraIncludeEnemy: true
  auraIncludeGeneral: true
  auraIncludeHand: false
  auraIncludeSelf: true
  auraRadius: CONFIG.WHOLE_BOARD_RADIUS
  modifiersContextObjects: [ModifierImmuneToSpellDamage.createContextObject()]

module.exports = PlayerModifierPreventSpellDamage
