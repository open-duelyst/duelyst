Logger = require 'app/common/logger'
Action = require './action'
CardType =       require 'app/sdk/cards/cardType'

class TeleportAction extends Action

  @type: "TeleportAction"
  fxResource: ["FX.Actions.Teleport"]

  constructor: () ->
    @type ?= TeleportAction.type
    super

  ###
   * Returns whether this was a valid teleport, i.e. whether source and target positions are different.
   * NOTE: in some teleport action subclasses, this may only return reliable values after execution!
   * @returns {Boolean}
  ###
  getIsValidTeleport: () ->
    targetPosition = @getTargetPosition()
    if targetPosition?
      sourcePosition = @getSourcePosition()
      if !sourcePosition? or sourcePosition.x != targetPosition.x or sourcePosition.y != targetPosition.y
        return true
    return false

  _execute: () ->
    super()

    unit = @getSource()
    board = @getGameSession().getBoard()
    targetPosition = @getTargetPosition()

    # at execution time, make sure the target position is unoccupied and on the board
    if unit? and unit.getIsActive() and targetPosition? and !board.getObstructionAtPositionForEntity(targetPosition, unit) and board.isOnBoard(targetPosition)
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "TeleportAction::execute - moving unit #{JSON.stringify(unit?.getLogName())} to #{targetPosition.x}, #{targetPosition.y}"
      unit.setPosition(targetPosition)
    else
      # teleport aborted at execution time
      @setTargetPosition(@getSourcePosition())

module.exports = TeleportAction
