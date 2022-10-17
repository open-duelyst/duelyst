Modifier = require './modifier'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierMyGeneralDamagedWatchBuffSelf extends ModifierMyGeneralDamagedWatch

  type:"ModifierMyGeneralDamagedWatchBuffSelf"
  @type:"ModifierMyGeneralDamagedWatchBuffSelf"

  @modifierName:"My General Damaged Watch"
  @description:"Whenever your General takes damage, this minion gains %X"

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statContextObject.appliedName = "Vengeful Rage"
    contextObject.modifiersContextObjects = [statContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onDamageDealtToGeneral: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierMyGeneralDamagedWatchBuffSelf
