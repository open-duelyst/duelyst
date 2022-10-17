Modifier = require './modifier'
ModifierPortal = require './modifierPortal'
i18next = require 'i18next'

class ModifierToggleStructure extends Modifier

  type:"ModifierToggleStructure"
  @type:"ModifierToggleStructure"

  @description:i18next.t("modifiers.toggle_structure_def")

  fxResource: ["FX.Modifiers.ModifierToggleStructure"]

  onDeactivate: () ->
    super()
    structureMod = @getCard().getModifierByClass(ModifierPortal)
    # stop this structure from moving or attacking (default structure behavior)
    if structureMod?
      structureMod.stopMove()
      structureMod.stopAttack()

  onActivate: () ->
    super()
    structureMod = @getCard().getModifierByClass(ModifierPortal)
    # allow this structure to move and attack
    if structureMod?
      structureMod.allowMove()
      structureMod.allowAttack()

module.exports = ModifierToggleStructure
