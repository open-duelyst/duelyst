Logger = require 'app/common/logger'
Action = require './action'
CONFIG = require 'app/common/config'

class BonusManaCoreAction extends Action

  # grants one permanent extra mana core (up to CONFIG.MAX_MANA)

  @type:"BonusManaCoreAction"

  constructor: (gameSession) ->
    @type ?= BonusManaCoreAction.type
    super(gameSession)

  _execute: () ->
    super()

    owner = @getOwner()
    if owner?
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "BonusManaCoreAction::execute for #{owner} grant 1 bonus mana core"
      if owner.getMaximumMana() < CONFIG.MAX_MANA
        owner.maximumMana++

module.exports = BonusManaCoreAction
