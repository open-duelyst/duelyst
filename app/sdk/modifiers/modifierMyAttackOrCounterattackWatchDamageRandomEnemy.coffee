ModifierMyAttackOrCounterattackWatch = require './modifierMyAttackOrCounterattackWatch'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'

class ModifierMyAttackOrCounterattackWatchDamageRandomEnemy extends ModifierMyAttackOrCounterattackWatch

  type:"ModifierMyAttackOrCounterattackWatchDamageRandomEnemy"
  @type:"ModifierMyAttackOrCounterattackWatchDamageRandomEnemy"

  damageAmount: 0

  @createContextObject: (damageAmount, options=undefined) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onMyAttackOrCounterattackWatch: (action) ->

    randomDamageAction = new RandomDamageAction(@getGameSession())
    randomDamageAction.setOwnerId(@getCard().getOwnerId())
    randomDamageAction.setSource(@getCard())
    randomDamageAction.setDamageAmount(@damageAmount)
    randomDamageAction.canTargetGenerals = true
    @getGameSession().executeAction(randomDamageAction)

module.exports = ModifierMyAttackOrCounterattackWatchDamageRandomEnemy
