Action = require './action'

class RemoveManaCoreAction extends Action

  # Removes a mana core

  @type:"RemoveManaCoreAction"

  manaAmount: 0

  constructor: (gameSession, manaAmount=0) ->
    @type ?= RemoveManaCoreAction.type
    @manaAmount = manaAmount
    super(gameSession)

  _execute: () ->
    super()

    owner = @getOwner()
    if owner?
      for i in [0...@manaAmount]
        if owner.getMaximumMana() > 0
          owner.maximumMana--
  
  getManaAmount: () ->
    return @manaAmount

  setManaAmount: (manaAmount) ->
    @manaAmount = Math.max(manaAmount, 0)

module.exports = RemoveManaCoreAction
