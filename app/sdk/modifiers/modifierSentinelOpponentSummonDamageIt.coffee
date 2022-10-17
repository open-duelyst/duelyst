ModifierSentinelOpponentSummon = require './modifierSentinelOpponentSummon'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSentinelOpponentSummonDamageIt extends ModifierSentinelOpponentSummon

  type:"ModifierSentinelOpponentSummonDamageIt"
  @type:"ModifierSentinelOpponentSummonDamageIt"

  @createContextObject: (description, transformCardId, damageAmount=0, options) ->
    contextObject = super(description, transformCardId, options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onOverwatch: (action) ->
    super(action) # transform unit
    # damage unit that was just summoned by enemy
    if action.getTarget()?
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(action.getTarget())
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierSentinelOpponentSummonDamageIt
