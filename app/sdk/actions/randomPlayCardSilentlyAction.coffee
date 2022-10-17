Logger = require 'app/common/logger'
PlayCardSilentlyAction = require './playCardSilentlyAction'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class RandomPlayCardSilentlyAction extends PlayCardSilentlyAction

  @type: "RandomPlayCardSilentlyAction"
  spawnPattern: null
  patternSourceIndex: null # center the spawn pattern around a specific entity, or the whole board
  patternSourcePosition: null # center the spawn pattern around a specific position, or the whole board

  constructor: (gameSession, ownerId, cardDataOrIndex, cardOwnedByGamesession) ->
    @type ?= RandomPlayCardSilentlyAction.type
    super(gameSession, ownerId, -1, -1, cardDataOrIndex, cardOwnedByGamesession)

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.patternSource = null

    return p

  getSpawnPattern: () ->
    return @spawnPattern

  setSpawnPattern: (spawnPattern) ->
    @spawnPattern = spawnPattern

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

    # find location to spawn
    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getCard()
      sourcePosition = @getSourcePosition()
      if card? and sourcePosition?
        if !@getSpawnPattern() # if no spawn pattern defined, use whole board
          # pick a random spawn location
          spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.ALL_BOARD_POSITIONS, card, card, 1)
        else # pick target position from spawn pattern
          patternSource = @getPatternSource()
          if patternSource? # around pattern source entity
            patternSourcePosition = patternSource.getPosition()
          else # around pattern source position
            patternSourcePosition = @getPatternSourcePosition()

          if patternSourcePosition?
            spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), patternSourcePosition, @getSpawnPattern(), card, card, 1)
          else # use whole board
            spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, @getSpawnPattern(), card, card, 1)

      if spawnLocations? and spawnLocations.length > 0
        position = spawnLocations[0]
        @setTargetPosition(position)
      else
        # nowhere to spawn, set target position to an invalid location
        @setTargetPosition({x: -1, y: -1})

module.exports = RandomPlayCardSilentlyAction
