Logger = require 'app/common/logger'
Action = require './action'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'

class BonusManaAction extends Action

  @type:"BonusManaAction"

  bonusMana: 1 # number of bonus mana
  bonusDuration: 1 # number of turns to keep the bonus for

  constructor: (gameSession) ->
    @type ?= BonusManaAction.type
    super(gameSession)

  getBonusMana: () ->
    return @bonusMana

  _execute: () ->
    super()

    target = @getTarget()
    if target? and !target.isOwnedByGameSession()
      owner = target.getOwner()
      ownerGeneral = @getGameSession().getGeneralForPlayer(owner)
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "BonusManaAction::execute for #{owner.getPlayerId()} with bonus #{@bonusMana} for #{@bonusDuration} turns"
      # max sure bonus mana won't take player over max mana
      bonusMana = @bonusMana
      if owner.getRemainingMana() + bonusMana > CONFIG.MAX_MANA
        bonusMana = CONFIG.MAX_MANA - owner.getRemainingMana()
      manaModifierContextObject = PlayerModifierManaModifier.createBonusManaContextObject(bonusMana)
      manaModifierContextObject.durationEndTurn = @bonusDuration
      @getGameSession().applyModifierContextObject(manaModifierContextObject, ownerGeneral)

module.exports = BonusManaAction
