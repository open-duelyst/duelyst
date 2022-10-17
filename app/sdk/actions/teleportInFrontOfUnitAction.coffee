Logger = require 'app/common/logger'
TeleportAction = require './teleportAction'
CardType =       require 'app/sdk/cards/cardType'

class TeleportInFrontOfUnitAction extends TeleportAction

  @type: "TeleportInFrontOfUnitAction"

  constructor: (gameSession, inFrontOfUnit, targetUnit) ->
    @type ?= TeleportInFrontOfUnitAction.type
    super(gameSession)
    @_private.inFrontOfUnit = inFrontOfUnit
    @setSource(targetUnit)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    
    p.inFrontOfUnit = null # used by the authoritative source action to know where to teleport
    
    return p

  _execute: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      # only do calculations server-side
      if @_private.inFrontOfUnit? and @getSource()
        # calculate "in front of me"
        position = @_private.inFrontOfUnit.getPosition()
        position.x += if @_private.inFrontOfUnit.isOwnedByPlayer1() then 1 else -1
        # now set the target position (this is what TeleportAction expects)
        @setTargetPosition(position)
        super() # and execute the teleport
    else
      super() # when not running as authoritative, use authoritative source action's data

module.exports = TeleportInFrontOfUnitAction
