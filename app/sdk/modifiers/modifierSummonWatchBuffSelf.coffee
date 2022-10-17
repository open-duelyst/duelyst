ModifierSummonWatch = require './modifierSummonWatch'
Modifier = require './modifier'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSummonWatchBuffSelf extends ModifierSummonWatch

  type:"ModifierSummonWatchBuffSelf"
  @type:"ModifierSummonWatchBuffSelf"

  @modifierName:"Summon Watch"
  @description: "Whenever you summon a minion, this minion gains %X"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, appliedName=null, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
        modifierName:@modifierName,
        description:Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff),
        appliedName:appliedName
      })
    ]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onSummonWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierSummonWatchBuffSelf
