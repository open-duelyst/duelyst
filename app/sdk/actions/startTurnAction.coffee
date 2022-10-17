CONFIG =     require 'app/common/config'
Action =     require './action'
Logger =     require 'app/common/logger'

class StartTurnAction extends Action

  @type:"StartTurnAction"

  constructor: () ->
    @type ?= StartTurnAction.type
    super

  isRemovableDuringScrubbing: () ->
    return false

  _execute: () ->
    @getGameSession().p_startTurn()

module.exports = StartTurnAction
