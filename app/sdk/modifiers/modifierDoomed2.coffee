ModifierEndTurnWatch = require './modifierEndTurnWatch'
ModifierDoomed = require './modifierDoomed'
i18next = require 'i18next'

class ModifierDoomed2 extends ModifierEndTurnWatch

  type: "ModifierDoomed2"
  @type: "ModifierDoomed2"

  @modifierName:i18next.t("modifiers.doomed_name")
  @description:i18next.t("modifiers.doomed_2_def")

  fxResource: ["FX.Modifiers.ModifierDoomed2"]

  isRemovable: false
  maxStacks: 1

  onTurnWatch: () ->
    super()

    if @numEndTurnsElapsed > 1 # don't apply and remove self in same turn!
      # apply next stage of Doom and remove self
      @getGameSession().applyModifierContextObject(ModifierDoomed.createContextObject(), @getCard())
      @getGameSession().removeModifier(@)

module.exports = ModifierDoomed2
