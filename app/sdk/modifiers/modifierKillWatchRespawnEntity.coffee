CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierKillWatch = require './modifierKillWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierKillWatchRespawnEntity extends ModifierKillWatch

  type:"ModifierKillWatchRespawnEntity"
  @type:"ModifierKillWatchRespawnEntity"

  @description:"Whenever Monolith Guardian destroys an enemy, it assimilates them"

  fxResource: ["FX.Modifiers.ModifierKillWatch", "FX.Modifiers.ModifierGenericSpawn"]
  cardDataOrIndexToSpawn: null

  @createContextObject: (spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true, options) ->
    contextObject = super(false, false, options)
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

  onKillWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      ownerId = @getSpawnOwnerId(action)
      cardDataOrIndexToSpawn = action.getTarget().createNewCardData()
      cardToSpawn = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(cardDataOrIndexToSpawn)
      spawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), action.getTargetPosition(), @spawnPattern, cardToSpawn, @getCard(), @spawnCount)
      for spawnPosition in spawnPositions
        if @spawnSilently
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        else
          spawnAction = new PlayCardAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierKillWatchRespawnEntity
