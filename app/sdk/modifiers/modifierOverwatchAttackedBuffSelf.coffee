Modifier = require './modifier'
ModifierOverwatchAttacked = require './modifierOverwatchAttacked'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierOverwatchAttackedBuffSelf extends ModifierOverwatchAttacked

  type:"ModifierOverwatchAttackedBuffSelf"
  @type:"ModifierOverwatchAttackedBuffSelf"

  @description: "When this minion is attacked, it gains %X"

  @createContextObject: (attackBuff=0, maxHPBuff=0, options) ->
    contextObject = super(options)
    statsBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statsBuff.appliedName = "Overwatcher's Preparation"
    contextObject.modifiersContextObjects = [statsBuff]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onOverwatch: (action) ->
    # apply all modifiers as un-managed
    # so they remain when this modifier is removed
    if @modifiersContextObjects?
      card = @getCard()
      for modifierContextObject in @modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, card)

module.exports = ModifierOverwatchAttackedBuffSelf
