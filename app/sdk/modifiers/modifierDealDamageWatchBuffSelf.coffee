Modifier = require './modifier'
ModifierDealDamageWatch = require './modifierDealDamageWatch'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierDealDamageWatchBuffSelf extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchBuffSelf"
  @type:"ModifierDealDamageWatchBuffSelf"

  @description: "Whenever this minion damages an enemy, this minion gains %X"

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, modAppliedName=undefined, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
        modifierName:@modifierName,
        appliedName:modAppliedName,
        description:Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff),
      })
    ]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onAfterDealDamage: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierDealDamageWatchBuffSelf
