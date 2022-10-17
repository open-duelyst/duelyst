Action = require './action'
CONFIG = require 'app/common/config'

class RestoreManaAction extends Action

  # restore spent mana to owner of this action

  @type:"RestoreManaAction"

  restoreManaAmount: 0

  constructor: (gameSession) ->
    @type ?= RestoreManaAction.type
    super(gameSession)

  setManaAmount: (manaToRestore) ->
    @restoreManaAmount = manaToRestore

  _execute: () ->
    super()

    owner = @getOwner()
    if owner?
      if owner.getRemainingMana() < owner.getMaximumMana()
        if owner.getRemainingMana() + @restoreManaAmount <= owner.getMaximumMana()
          owner.remainingMana += @restoreManaAmount
        else
          owner.remainingMana = owner.getMaximumMana()

module.exports = RestoreManaAction
