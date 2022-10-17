Modifier = require './modifier'
MoveAction = require 'app/sdk/actions/moveAction'
TeleportAction = require 'app/sdk/actions/teleportAction'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'

class ModifierEnemyTeamMoveWatch extends Modifier

  type:"ModifierEnemyTeamMoveWatch"
  @type:"ModifierEnemyTeamMoveWatch"

  @modifierName:"Any Move Watch: Enemy"
  @description:"Whenever an enemy minion is moved for any reason..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if (action instanceof MoveAction or (action instanceof TeleportAction and action.getIsValidTeleport())) and action.getSource().getOwnerId() is @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId() and !action.getSource().getIsGeneral?()
      @onEnemyTeamMoveWatch(action, action.getSource())
    else if (action instanceof SwapUnitsAction) # for swap units action, must check both source AND target (both could be on my team)
      if action.getSource().getOwnerId() is @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId() and !action.getSource().getIsGeneral?()
        @onEnemyTeamMoveWatch(action, action.getSource())
      if action.getTarget().getOwnerId() is @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId() and !action.getSource().getIsGeneral?()
        @onEnemyTeamMoveWatch(action, action.getTarget())

  onEnemyTeamMoveWatch: (action, movingTarget) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyTeamMoveWatch
