ModifierOpeningGambit = require './modifierOpeningGambit'
RemoveManaCoreAction = require 'app/sdk/actions/removeManaCoreAction'

class ModifierOpeningGambitDestroyManaCrystal extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDestroyManaCrystal"
  @type: "ModifierOpeningGambitDestroyManaCrystal"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  amountToRemove: 1
  takeFromOwner: false

  @createContextObject: (takeFromOwner=false, amountToRemove=1, options) ->
    contextObject = super(options)
    contextObject.amountToRemove = amountToRemove
    contextObject.takeFromOwner = takeFromOwner
    return contextObject

  onOpeningGambit: () ->
    super()

    removeManaCoreAction = new RemoveManaCoreAction(@getGameSession(), @amountToRemove)
    removeManaCoreAction.setSource(@getCard())
    if @takeFromOwner
      removeManaCoreAction.setOwnerId(@getCard().getOwnerId())
    else
      removeManaCoreAction.setOwnerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))
    @getGameSession().executeAction(@getGameSession().executeAction(removeManaCoreAction))

module.exports = ModifierOpeningGambitDestroyManaCrystal
