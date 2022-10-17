Modifier = require './modifier'
ModifierMyMinionOrGeneralDamagedWatch = require './modifierMyMinionOrGeneralDamagedWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierMyMinionOrGeneralDamagedWatchBuffSelf extends ModifierMyMinionOrGeneralDamagedWatch

  type:"ModifierMyMinionOrGeneralDamagedWatchBuffSelf"
  @type:"ModifierMyMinionOrGeneralDamagedWatchBuffSelf"

  @modifierName:"My Minion or General Damaged Watch"
  @description:"Each time a friendly minion or your General takes damage, gain %X"

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statContextObject.appliedName = "Protector\'s Rage"
    contextObject.modifiersContextObjects = [statContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onDamageDealtToMinionOrGeneral: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierMyMinionOrGeneralDamagedWatchBuffSelf
