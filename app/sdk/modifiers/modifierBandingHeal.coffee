CONFIG =       require 'app/common/config'
ModifierBanding =   require './modifierBanding'
ModifierBandedHeal =     require './modifierBandedHeal'
i18next = require('i18next')

class ModifierBandingHeal extends ModifierBanding

  type:"ModifierBandingHeal"
  @type:"ModifierBandingHeal"

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealHeal"]

  @createContextObject: (options = undefined) ->
    contextObject = super(options)
    contextObject.appliedName = i18next.t("modifiers.banding_heal_applied_name")
    bandedContextObject = ModifierBandedHeal.createContextObject()
    bandedContextObject.appliedName = i18next.t("modifiers.banded_heal_applied_name")
    contextObject.modifiersContextObjects = [bandedContextObject]
    return contextObject


module.exports = ModifierBandingHeal
