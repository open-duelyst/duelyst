ModifierStartTurnWatch = require './modifierStartTurnWatch'
KillAction = require 'app/sdk/actions/killAction'
RemoveAction = require 'app/sdk/actions/removeAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierStartTurnWatchBounceToActionBar extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchBounceToActionBar"
  @type:"ModifierStartTurnWatchBounceToActionBar"

  maxStacks: 1

  onTurnWatch: (action) ->
    thisEntity = @getCard()
    if @getCard()?.getIsActive()
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(thisEntity.getOwnerId())
      removeOriginalEntityAction.setTarget(thisEntity)
      @getGameSession().executeAction(removeOriginalEntityAction)

      # put a fresh card matching the original unit into hand
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), thisEntity.getOwnerId(), thisEntity.createNewCardData())
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierStartTurnWatchBounceToActionBar
