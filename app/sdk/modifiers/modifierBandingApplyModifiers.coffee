CONFIG =       require 'app/common/config'
ModifierBanding =   require './modifierBanding'
ModifierBandedHeal =     require './modifierBandedHeal'

class ModifierBandingApplyModifiers extends ModifierBanding

  type:"ModifierBandingApplyModifiers"
  @type:"ModifierBandingApplyModifiers"

  maxStacks: 1

  @description: "Apply buffs"

  fxResource: ["FX.Modifiers.ModifierZeal"]

  @createContextObject: (modifiersContextObjects, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.description = description
    return contextObject

module.exports = ModifierBandingApplyModifiers
