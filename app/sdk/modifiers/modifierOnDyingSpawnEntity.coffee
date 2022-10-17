CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierOnDying = require './modifierOnDying'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierOnDyingSpawnEntity extends ModifierOnDying

  type:"ModifierOnDyingSpawnEntity"
  @type:"ModifierOnDyingSpawnEntity"

  cardDataOrIndexToSpawn: null
  spawnCount: null
  spawnPattern: null
  spawnSilently: true
  fxResource: ["FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true,options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  onDying: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative() and @getCardDataOrIndexToSpawn()?
      ownerId = @getSpawnOwnerId(action)
      spawnPositions = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier(@, ModifierDyingWishSpawnEntity)
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

module.exports = ModifierOnDyingSpawnEntity
