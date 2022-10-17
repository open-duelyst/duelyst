Modifier = require './modifier'
MoveAction = require 'app/sdk/actions/moveAction'
TeleportAction = require 'app/sdk/actions/teleportAction'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'

class ModifierMyMoveWatchAnyReason extends Modifier

  type:"ModifierMyMoveWatchAnyReason"
  @type:"ModifierMyMoveWatchAnyReason"

  @modifierName:"Move Watch Any Reason: Self"
  @description:"Move Watch Any Reason: Self"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  onAction: (event) ->
    super(event)
    action = event.action

    if (action instanceof MoveAction or (action instanceof TeleportAction and action.getIsValidTeleport())) and action.getSource() is @getCard()
      @onMyMoveWatchAnyReason(action)
    else if action instanceof SwapUnitsAction and (action.getSource() is @getCard() or action.getTarget() is @getCard())
      @onMyMoveWatchAnyReason(action)

  onMyMoveWatchAnyReason: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyMoveWatchAnyReason
