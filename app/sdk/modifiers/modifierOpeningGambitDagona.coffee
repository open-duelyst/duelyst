ModifierOpeningGambit = require './modifierOpeningGambit'
ModifierDyingWishDagona = require './modifierDyingWishDagona'
RemoveAction = require 'app/sdk/actions/removeAction'

class ModifierOpeningGambitDagona extends ModifierOpeningGambit

  type:"ModifierOpeningGambitDagona"
  @type:"ModifierOpeningGambitDagona"

  onOpeningGambit: () ->
    # consume original unit at spawn position (remove it from board)
    if !(@getGameSession().getBoard().getCardAtPosition(@getCard().getPosition()) == @getCard())
      originalCardAtPosition = @getGameSession().getBoard().getCardAtPosition(@getCard().getPosition())
      removeOriginalEntityAction = new RemoveAction(@getGameSession())
      removeOriginalEntityAction.setOwnerId(@getOwnerId())
      removeOriginalEntityAction.setTarget(originalCardAtPosition)

      # store data of the consumed unit
      if @getCard().hasModifierClass(ModifierDyingWishDagona)
        dyingWishModifier = @getCard().getModifiersByClass(ModifierDyingWishDagona)[0]
        dyingWishModifier.setCardDataOrIndexToSpawn(originalCardAtPosition.createNewCardData())
        dyingWishModifier.setSpawnOwnerId(originalCardAtPosition.getOwnerId())

      # execute remove original unit from board
      @getGameSession().executeAction(removeOriginalEntityAction)

module.exports = ModifierOpeningGambitDagona
