ModifierDealDamageWatchHealMyGeneral = require './modifierDealDamageWatchHealMyGeneral'

class ModifierDealDamageWatchIfMinionHealMyGeneral extends ModifierDealDamageWatchHealMyGeneral

  type:"ModifierDealDamageWatchIfMinionHealMyGeneral"
  @type:"ModifierDealDamageWatchIfMinionHealMyGeneral"

  @modifierName:"Deal Damage Watch"
  @description:"Whenever this minion deals damage to a minion, restore Health to your General"

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch", "FX.Modifiers.ModifierGenericHeal"]

  onDealDamage: (action) ->

    target = action.getTarget()
    if target? and !target.getIsGeneral()
      super(action)

module.exports = ModifierDealDamageWatchIfMinionHealMyGeneral
