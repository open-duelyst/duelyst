Modifier = require './modifier.coffee'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch.coffee'
DamageAction = require 'app/sdk/actions/damageAction.coffee'

class ModifierMyGeneralDamagedWatchBuffSelfAttackForSame extends ModifierMyGeneralDamagedWatch

  type:"ModifierMyGeneralDamagedWatchBuffSelfAttackForSame"
  @type:"ModifierMyGeneralDamagedWatchBuffSelfAttackForSame"

  @modifierName:"My General Damaged Watch"
  @description:"Whenever your General takes damage, this minion gains that much Attack"

  @createContextObject: (modifierAppliedName,options) ->
    contextObject = super(options)
    contextObject.modifierAppliedName = modifierAppliedName
    return contextObject

  onDamageDealtToGeneral: (action) ->
    modifierContextObject = Modifier.createContextObjectWithAttributeBuffs(action.getTotalDamageAmount())
    modifierContextObject.appliedName = @modifierAppliedName
    @getGameSession().applyModifierContextObject(modifierContextObject, @getCard(), @)

module.exports = ModifierMyGeneralDamagedWatchBuffSelfAttackForSame
