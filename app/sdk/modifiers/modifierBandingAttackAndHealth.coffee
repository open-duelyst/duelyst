ModifierBanding =         require './modifierBanding'
ModifierBanded =       require './modifierBanded'
Stringifiers =         require 'app/sdk/helpers/stringifiers'

class ModifierBandingAttackAndHealth extends ModifierBanding

  type:"ModifierBandingAttackAndHealth"
  @type:"ModifierBandingAttackAndHealth"

  @description: "Gains %X / %Y"

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealAttackAndHealth"]

  @createContextObject: (attackBuff=0, healthBuff=0, options = undefined) ->
    contextObject = super(options)
    contextObject.appliedName = "Zeal: Lion\'s Fortitude"
    buffContextObject = ModifierBanded.createContextObject(attackBuff, healthBuff)
    buffContextObject.appliedName = "Zealed: Lion's Fortitude"
    contextObject.modifiersContextObjects = [buffContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      replaceText = @description.replace /%X/, Stringifiers.stringifyStatBuff(subContextObject.attributeBuffs.atk)
      replaceText = replaceText.replace /%Y/, Stringifiers.stringifyStatBuff(subContextObject.attributeBuffs.maxHP)
    else
      return @description

module.exports = ModifierBandingAttackAndHealth
