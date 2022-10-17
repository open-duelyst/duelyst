Action = require './action'
CardType =       require 'app/sdk/cards/cardType'

class ApplyExhaustionAction extends Action

  @type:"ApplyExhaustionAction"

  constructor: (gameSession) ->
    @type ?= ApplyExhaustionAction.type
    super

  _execute: () ->
    super()
    target = @getTarget()
    if target?
      target.applyExhaustion()

module.exports = ApplyExhaustionAction
