ModifierEndTurnWatch = require './modifierEndTurnWatch'
ModifierDoomed2 = require './modifierDoomed2'
i18next = require 'i18next'

class ModifierDoomed3 extends ModifierEndTurnWatch

  type: "ModifierDoomed3"
  @type: "ModifierDoomed3"

  @modifierName:i18next.t("modifiers.doomed_name")
  @description:i18next.t("modifiers.doomed_3_def")

  fxResource: ["FX.Modifiers.ModifierDoomed3"]

  isRemovable: false
  maxStacks: 1

  onTurnWatch: () ->
    super()

    # apply next stage of Doom and remove self
    @getGameSession().applyModifierContextObject(ModifierDoomed2.createContextObject(), @getCard())
    @getGameSession().removeModifier(@)

module.exports = ModifierDoomed3
