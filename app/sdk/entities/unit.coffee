CONFIG = require 'app/common/config'
Logger = require 'app/common/logger'
Entity = require './entity'
CardType = require 'app/sdk/cards/cardType'
ModifierStrikeback = require 'app/sdk/modifiers/modifierStrikeback'
PlayerModifierBattlePetManager = require 'app/sdk/playerModifiers/playerModifierBattlePetManager'

_ = require 'underscore'

class Unit extends Entity

  type: CardType.Unit
  @type: CardType.Unit
  name: "Unit"

  isTargetable: true
  isObstructing: true
  hp: 1
  maxHP: 1
  speed: CONFIG.SPEED_BASE
  reach: CONFIG.REACH_MELEE

  onApplyToBoard: (board,x,y,sourceAction) ->
    super(board, x, y, sourceAction)

    # spawn units as exhausted
    @applyExhaustion()

  onApplyModifiersForApplyToNewLocation: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      # unit base modifiers should always be applied first
      # they should always react before any card specific modifiers

      # generals manage their battle pets
      if @getIsGeneral() and !@hasModifierClass(PlayerModifierBattlePetManager)
        contextObject = PlayerModifierBattlePetManager.createContextObject()
        contextObject.isInherent = true
        @getGameSession().applyModifierContextObject(contextObject, @)

      # all units strikeback
      if !@hasModifierClass(ModifierStrikeback)
        contextObject = ModifierStrikeback.createContextObject()
        contextObject.isInherent = true
        @getGameSession().applyModifierContextObject(contextObject, @)

    # apply card specific modifiers
    super()

module.exports = Unit
