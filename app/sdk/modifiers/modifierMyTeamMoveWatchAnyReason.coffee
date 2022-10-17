Modifier = require './modifier'
MoveAction = require 'app/sdk/actions/moveAction'
TeleportAction = require 'app/sdk/actions/teleportAction'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'

class ModifierMyTeamMoveWatchAnyReason extends Modifier

  type:"ModifierMyTeamMoveWatchAnyReason"
  @type:"ModifierMyTeamMoveWatchAnyReason"

  @modifierName:"Any Move Watch: Self"
  @description:"Whenever a friendly minion is moved for any reason..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if (action instanceof MoveAction or (action instanceof TeleportAction and action.getIsValidTeleport())) and action.getSource().getOwnerId() is @getCard().getOwnerId() and !action.getSource().getIsGeneral?()
      @onMyTeamMoveWatch(action, action.getSource())
    else if (action instanceof SwapUnitsAction) # for swap units action, must check both source AND target (both could be on my team)
      if action.getSource().getOwnerId() is @getCard().getOwnerId() and !action.getSource().getIsGeneral?()
        @onMyTeamMoveWatch(action, action.getSource())
      if action.getTarget().getOwnerId() is @getCard().getOwnerId() and !action.getTarget().getIsGeneral?()
        @onMyTeamMoveWatch(action, action.getTarget())

  onMyTeamMoveWatch: (action, buffTarget) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyTeamMoveWatchAnyReason
