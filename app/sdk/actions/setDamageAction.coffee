Action = require './action'
CardType = require 'app/sdk/cards/cardType'

class SetDamageAction extends Action

  @type:"SetDamageAction"
  damageValue: 0

  constructor: () ->
    @type ?= SetDamageAction.type
    super

  _execute: () ->
    super()

    source = @getSource()
    target = @getTarget()

    if target?
      target.setDamage(@damageValue)

module.exports = SetDamageAction
