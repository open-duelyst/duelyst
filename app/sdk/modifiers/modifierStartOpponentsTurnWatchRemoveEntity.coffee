ModifierStartOpponentsTurnWatch = require './modifierStartOpponentsTurnWatch'
RemoveAction = require 'app/sdk/actions/removeAction'

class ModifierStartOpponentsTurnWatchRemoveEntity extends ModifierStartOpponentsTurnWatch

  type:"ModifierStartOpponentsTurnWatchRemoveEntity"
  @type:"ModifierStartOpponentsTurnWatchRemoveEntity"

  onTurnWatch: (action) ->
    if @getCard()?.getIsActive()
      removeEntityAction = new RemoveAction(@getGameSession())
      removeEntityAction.setOwnerId(@getCard().getOwnerId())
      removeEntityAction.setTarget(@getCard())
      removeEntityAction.setIsDepthFirst(true)
      @getGameSession().executeAction(removeEntityAction)

module.exports = ModifierStartOpponentsTurnWatchRemoveEntity
