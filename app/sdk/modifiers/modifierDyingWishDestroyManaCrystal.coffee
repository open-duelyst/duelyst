ModifierDyingWish = require './modifierDyingWish'
RemoveManaCoreAction = require 'app/sdk/actions/removeManaCoreAction'

class ModifierDyingWishDestroyManaCrystal extends ModifierDyingWish

  type: "ModifierDyingWishDestroyManaCrystal"
  @type: "ModifierDyingWishDestroyManaCrystal"

  fxResource: ["FX.Modifiers.ModifierDyingWish"]

  amountToRemove: 1
  takeFromOwner: false

  @createContextObject: (takeFromOwner=false, amountToRemove=1, options) ->
    contextObject = super(options)
    contextObject.amountToRemove = amountToRemove
    contextObject.takeFromOwner = takeFromOwner
    return contextObject

  onDyingWish: () ->
    super()

    removeManaCoreAction = new RemoveManaCoreAction(@getGameSession(), @amountToRemove)
    removeManaCoreAction.setSource(@getCard())
    if @takeFromOwner
      removeManaCoreAction.setOwnerId(@getCard().getOwnerId())
    else
      removeManaCoreAction.setOwnerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))
    @getGameSession().executeAction(@getGameSession().executeAction(removeManaCoreAction))

module.exports = ModifierDyingWishDestroyManaCrystal
