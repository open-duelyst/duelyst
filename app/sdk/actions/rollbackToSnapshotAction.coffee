CONFIG =     require 'app/common/config'
Action =     require './action'
GameStatus =   require 'app/sdk/gameStatus'
Logger =     require 'app/common/logger'

class RollbackToSnapshotAction extends Action

  @type:"RollbackToSnapshotAction"

  delay: CONFIG.TURN_DELAY

  constructor: () ->
    @type ?= RollbackToSnapshotAction.type
    super

  _execute: () ->
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "#{this.type}::execute"
    @getGameSession().p_requestRollbackToSnapshot()

module.exports = RollbackToSnapshotAction
