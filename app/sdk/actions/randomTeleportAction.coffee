Logger = require 'app/common/logger'
TeleportAction = require './teleportAction'
CardType =       require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class RandomTeleportAction extends TeleportAction

  @type: "RandomTeleportAction"
  teleportPattern: null
  patternSourceIndex: null # center the teleport pattern around a specific entity, or the whole board
  patternSourcePosition: null # center the teleport pattern around a specific position, or the whole board

  constructor: () ->
    @type ?= RandomTeleportAction.type
    super

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.patternSource = null

    return p

  getTeleportPattern: () ->
    return @teleportPattern

  setTeleportPattern: (teleportPattern) ->
    @teleportPattern = teleportPattern

  getPatternSource: () ->
    if !@_private.patternSource? and @patternSourceIndex?
      @_private.patternSource = @getGameSession().getCardByIndex(@patternSourceIndex)
    return @_private.patternSource

  setPatternSource: (patternSource) ->
    @patternSourceIndex = patternSource.getIndex()

  getPatternSourcePosition: () ->
    return @patternSourcePosition

  setPatternSourcePosition: (patternSourcePosition) ->
    @patternSourcePosition = patternSourcePosition

  _modifyForExecution: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      source = @getSource()
      if source?
        if !@getTeleportPattern() # if no teleport pattern defined, use whole board
          # pick a random "spawn" location - locations that units can spawn are also valid target position for teleporting this unit
          moveLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.ALL_BOARD_POSITIONS, source, source, 1)
        else # pick target position from teleport pattern
          patternSource = @getPatternSource()
          if patternSource? # around pattern source entity
            patternSourcePosition = patternSource.getPosition()
          else # around pattern source position
            patternSourcePosition = @getPatternSourcePosition()

          if patternSourcePosition?
            moveLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), patternSourcePosition, @getTeleportPattern(), source, source, 1)
          else # use whole board
            moveLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, @getTeleportPattern(), source, source, 1)

        if moveLocations.length > 0
          position = moveLocations[0]
          @setTargetPosition(position)
        else
          @setTargetPosition(@getSourcePosition())

module.exports = RandomTeleportAction
