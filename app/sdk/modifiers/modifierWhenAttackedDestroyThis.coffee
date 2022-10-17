Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
KillAction = require 'app/sdk/actions/killAction'

class ModifierWhenAttackedDestroyThis extends Modifier

  type:"ModifierWhenAttackedDestroyThis"
  @type:"ModifierWhenAttackedDestroyThis"

  onAfterAction: (event) ->
    super(event)
    action = event.action

    # when attacked, remove self immediately
    if action instanceof AttackAction and action.getTarget() == @getCard() and !action.getIsImplicit()
      if @getCard()?.getIsActive()
        killAction = new KillAction(@getGameSession())
        killAction.setOwnerId(@getCard().getOwnerId())
        killAction.setSource(@getCard())
        killAction.setTarget(@getCard())
        @getGameSession().executeAction(killAction)

module.exports = ModifierWhenAttackedDestroyThis
