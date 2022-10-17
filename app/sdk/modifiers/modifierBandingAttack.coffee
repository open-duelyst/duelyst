ModifierBanding =         require './modifierBanding'
ModifierBanded =       require './modifierBanded'
Stringifiers =         require 'app/sdk/helpers/stringifiers'
i18next = require('i18next')

class ModifierBandingAttack extends ModifierBanding

  type:"ModifierBandingAttack"
  @type:"ModifierBandingAttack"

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealAttack"]

  @createContextObject: (attackBuff=0, options = undefined) ->
    contextObject = super(options)
    contextObject.appliedName = i18next.t("modifiers.banding_attack_applied_name")
    attackBuffContextObject = ModifierBanded.createContextObject(attackBuff)
    attackBuffContextObject.appliedName = i18next.t("modifiers.banded_attack_applied_name")
    contextObject.modifiersContextObjects = [attackBuffContextObject]
    return contextObject

module.exports = ModifierBandingAttack
