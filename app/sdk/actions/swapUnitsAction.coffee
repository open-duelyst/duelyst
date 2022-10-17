Logger = require 'app/common/logger'
Action = require './action'
CardType = require 'app/sdk/cards/cardType'

class SwapUnitsAction extends Action

  @type: "SwapUnitsAction"
  fxResource: ["FX.Actions.Teleport"]

  constructor: () ->
    @type ?= SwapUnitsAction.type
    super

  _execute: () ->

    super()

    if @getSource()? and @getTarget()?
      # normally we'll swap these units based on where they were when the action was created
      # but if either unit wasn't yet on the board at action creation, re-evaluate
      # their positions at action execution
      board = @getGameSession().getBoard()

      if !board.isOnBoard(@getTargetPosition()) || !board.isOnBoard(@getSourcePosition())
        @setTargetPosition(@getTarget().getPosition())
        @setSourcePosition(@getSource().getPosition())

      if board.isOnBoard(@getTargetPosition()) && board.isOnBoard(@getSourcePosition())
        @getSource().setPosition(@getTargetPosition())
        @getTarget().setPosition(@getSourcePosition())

module.exports = SwapUnitsAction
