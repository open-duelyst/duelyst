CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierTakeDamageWatchSpawnEntity extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchSpawnEntity"
  @type:"ModifierTakeDamageWatchSpawnEntity"

  @modifierName:"Take Damage Watch"
  @description:"Whenever this minion takes damage, summon %X nearby"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]
  cardDataOrIndexToSpawn: null

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription = "", spawnCount=1, spawnPattern=CONFIG.PATTERN_3x3, spawnSilently=true,options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.spawnDescription
    else
      return @description

  onDamageTaken: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      ownerId = @getSpawnOwnerId(action)
      spawnPositions = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier(@, ModifierTakeDamageWatchSpawnEntity)
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

module.exports = ModifierTakeDamageWatchSpawnEntity
