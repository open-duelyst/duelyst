CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
Action =       require './action'
CardType =       require 'app/sdk/cards/cardType'

class MoveAction extends Action

  @type:"MoveAction"

  constructor: () ->
    @type ?= MoveAction.type
    super

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.cachedPath = null

    return p

  # target and source should always be the same
  getTarget: @::getSource

  getPath:() ->
    if !@_private.cachedPath?
      entity = @getTarget()
      @_private.cachedPath = entity.getMovementRange().getPathTo(@getGameSession().getBoard(), entity, @getTargetPosition())
    return @_private.cachedPath

  _execute: () ->
    super()

    entity = @getTarget()
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "MoveAction::execute - moving entity #{entity?.getLogName()} to (#{@getTargetPosition().x},#{@getTargetPosition().y})"

    # force path regeneration before moving entity
    @_private.cachedPath = null
    @getPath()

    # move entity
    entity.setPosition(@getTargetPosition())
    entity.setMovesMade(entity.getMovesMade() + 1)

module.exports = MoveAction
