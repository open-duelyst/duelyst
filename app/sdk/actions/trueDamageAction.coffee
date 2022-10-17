DamageAction =     require './damageAction'
_ = require 'underscore'

###
  True damage actions cannot be modified in any way and always deals the exact damage initially set in the action.
###
class TrueDamageAction extends DamageAction

  @type:"TrueDamageAction"

  constructor: () ->
    @type ?= TrueDamageAction.type
    super

  getTotalDamageAmount: () ->
    return @getDamageAmount()

module.exports = TrueDamageAction
