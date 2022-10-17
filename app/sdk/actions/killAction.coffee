Logger =     require 'app/common/logger'
Action = require './action'
CardType =       require 'app/sdk/cards/cardType'
_ = require 'underscore'

class KillAction extends Action

  @type:"KillAction"
  damageAmount: null

  constructor: () ->
    @type ?= KillAction.type
    super

  _execute: () ->
    super()

    source = @getSource()
    target = @getTarget()

    if target
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "#{this.type}::execute - kill #{target.getName()}.".red
      dieAction = target.actionDie(source)
      @getGameSession().executeAction(dieAction)

module.exports = KillAction
