Action = require './action'
CardType =       require 'app/sdk/cards/cardType'

class RefreshExhaustionAction extends Action

  @type:"RefreshExhaustionAction"

  constructor: () ->
    @type ?= RefreshExhaustionAction.type
    super

  _execute: () ->
    super()
    target = @getTarget()
    if target?
      target.refreshExhaustion()

module.exports = RefreshExhaustionAction
