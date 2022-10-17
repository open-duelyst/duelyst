ModifierDealDamageWatch = require './modifierDealDamageWatch'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierDealDamageWatchHealorDamageGeneral extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchHealorDamageGeneral"
  @type:"ModifierDealDamageWatchHealorDamageGeneral"

  @modifierName:"Deal Damage Watch"
  @description:"Whenever this minion deals damage, either deal %X damage to the enemy General OR restore %X Health to your General"

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch"]

  @createContextObject: (healDamageAmount=0, options) ->
    contextObject = super(options)
    contextObject.healDamageAmount = healDamageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/g, modifierContextObject.healDamageAmount
    else
      return @description

  onDealDamage: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      myGeneral = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      potentialTargets = [myGeneral, enemyGeneral]
      target = potentialTargets[@getGameSession().getRandomIntegerForExecution(potentialTargets.length)]

      if target is myGeneral
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getCard().getOwnerId())
        healAction.setTarget(myGeneral)
        healAction.setHealAmount(@healDamageAmount)
        @getGameSession().executeAction(healAction)
      else if target is enemyGeneral
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setTarget(enemyGeneral)
        damageAction.setDamageAmount(@healDamageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierDealDamageWatchHealorDamageGeneral
