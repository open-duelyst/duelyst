ModifierDeathWatch = require './modifierDeathWatch'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'
Modifier = require './modifier'

class ModifierDeathWatchGainAttackEqualToEnemyAttack extends ModifierDeathWatch

  type:"ModifierDeathWatchGainAttackEqualToEnemyAttack"
  @type:"ModifierDeathWatchGainAttackEqualToEnemyAttack"

  @modifierName:"Deathwatch"
  @description:"When an enemy minion dies, gain attack equal to its attack"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericChain"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  onDeathWatch: (action) ->
    #if the target is an enemy minion
    if action.getTarget().getOwnerId() isnt @getCard().getOwnerId()
      atkBuff = action.getTarget().getATK()
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(atkBuff,0)
      statContextObject.appliedName = "Upgraded module"
      @getGameSession().applyModifierContextObject(statContextObject, @getCard())

module.exports = ModifierDeathWatchGainAttackEqualToEnemyAttack
