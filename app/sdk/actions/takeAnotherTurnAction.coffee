CONFIG =     require 'app/common/config'
Action =     require './action'
GameStatus =   require 'app/sdk/gameStatus'
Logger =     require 'app/common/logger'

class TakeAnotherTurnAction extends Action

  @type:"TakeAnotherTurnAction"

  constructor: () ->
    @type ?= TakeAnotherTurnAction.type
    super

  _execute: () ->
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "#{this.type}::execute - setting current player to take a second turn"
    if @getGameSession().willSwapCurrentPlayerNextTurn()
      @getGameSession().skipSwapCurrentPlayerNextTurn()

module.exports = TakeAnotherTurnAction
