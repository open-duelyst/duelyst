CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit = require './modifierOpeningGambit'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierOpeningGambitSpawnEnemyMinionNearOpponent extends ModifierOpeningGambit

  type:"ModifierOpeningGambitSpawnEnemyMinionNearOpponent"
  @type:"ModifierOpeningGambitSpawnEnemyMinionNearOpponent"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnCount=1, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnCount = spawnCount
    return contextObject

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      opponentId = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId()
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getPosition(), CONFIG.PATTERN_3x3, card, @getCard(), 8)
      for i in [0...@spawnCount]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), opponentId, position.x, position.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitSpawnEnemyMinionNearOpponent