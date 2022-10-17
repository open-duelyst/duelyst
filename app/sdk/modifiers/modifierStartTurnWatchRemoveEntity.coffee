ModifierStartTurnWatch = require './modifierStartTurnWatch'
RemoveAction = require 'app/sdk/actions/removeAction'

class ModifierStartTurnWatchRemoveEntity extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchRemoveEntity"
  @type:"ModifierStartTurnWatchRemoveEntity"

  onTurnWatch: (action) ->
    if @getCard()?.getIsActive()
      removeEntityAction = new RemoveAction(@getGameSession())
      removeEntityAction.setOwnerId(@getCard().getOwnerId())
      removeEntityAction.setTarget(@getCard())
      removeEntityAction.setIsDepthFirst(true)
      @getGameSession().executeAction(removeEntityAction)

module.exports = ModifierStartTurnWatchRemoveEntity
