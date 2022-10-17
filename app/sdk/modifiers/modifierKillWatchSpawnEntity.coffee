CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierKillWatch = require './modifierKillWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierKillWatchSpawnEntity extends ModifierKillWatch

  type:"ModifierKillWatchSpawnEntity"
  @type:"ModifierKillWatchSpawnEntity"

  fxResource: ["FX.Modifiers.ModifierKillWatch", "FX.Modifiers.ModifierGenericSpawn"]

  cardDataOrIndexToSpawn: null

  @createContextObject: (cardDataOrIndexToSpawn, includeAllies=true, includeGenerals=true, spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true, options) ->
    contextObject = super(includeAllies, includeGenerals, options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  onKillWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      ownerId = @getSpawnOwnerId(action)
      cardToSpawn = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), action.getTargetPosition(), @spawnPattern, cardToSpawn, @getCard(), @spawnCount)
      for spawnPosition in spawnPositions
        cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn()
        if @spawnSilently
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        else
          spawnAction = new PlayCardAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierKillWatchSpawnEntity
