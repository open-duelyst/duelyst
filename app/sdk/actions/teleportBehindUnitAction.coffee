Logger = require 'app/common/logger'
TeleportAction = require './teleportAction'

class TeleportBehindUnitAction extends TeleportAction

  @type: "TeleportBehindUnitAction"

  constructor: (gameSession, behindUnit, targetUnit) ->
    @type ?= TeleportBehindUnitAction.type
    super(gameSession)
    @_private.behindUnit = behindUnit
    @setSource(targetUnit)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.behindUnit = null # used by the authoritative source action to know where to teleport

    return p

  _execute: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      # only do calculations server-side
      if @_private.behindUnit? and @getSource()
        # calculate "in front of me"
        position = @_private.behindUnit.getPosition()
        position.x += if @_private.behindUnit.isOwnedByPlayer1() then -1 else 1
        # now set the target position (this is what TeleportAction expects)
        @setTargetPosition(position)
        super() # and execute the teleport
    else
      super() # when not running as authoritative, use authoritative source action's data

module.exports = TeleportBehindUnitAction
