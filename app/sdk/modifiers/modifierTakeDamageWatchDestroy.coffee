ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
KillAction = require 'app/sdk/actions/killAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDestroy extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDestroy"
  @type:"ModifierTakeDamageWatchDestroy"

  @modifierName:"Take Damage Watch"
  @description:"Destroy any minion that deals damage to this one"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch"]

  onDamageTaken: (action) ->
    super(action)

    # go back to closest source card that is a unit
    sourceCard = action.getSource()?.getAncestorCardOfType(CardType.Unit)

    # kill any minion that damages this one
    if sourceCard? and !sourceCard.getIsGeneral()
      target = sourceCard
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getCard())
      killAction.setTarget(target)
      @getGameSession().executeAction(killAction)

module.exports = ModifierTakeDamageWatchDestroy
