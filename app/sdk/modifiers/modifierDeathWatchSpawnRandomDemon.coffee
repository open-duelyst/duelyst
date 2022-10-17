CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDeathWatch = require './modifierDeathWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
GameFormat = require 'app/sdk/gameFormat'

class ModifierDeathWatchSpawnRandomDemon extends ModifierDeathWatch

  type:"ModifierDeathWatchSpawnRandomDemon"
  @type:"ModifierDeathWatchSpawnRandomDemon"

  possibleCardsToSpawn: null
  spawnCount: 1
  spawnSilently: true # most reactive spawns should be silent, i.e. no followups and no opening gambits
  spawnPattern: CONFIG.PATTERN_3x3

  fxResource: ["FX.Modifiers.ModifierDeathWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (possibleCardsToSpawn, spawnCount=1, spawnPattern=CONFIG.PATTERN_3x3, spawnSilently=true,options) ->
    contextObject = super(options)
    contextObject.possibleCardsToSpawn = possibleCardsToSpawn
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  onDeathWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      ownerId = @getSpawnOwnerId(action)
      spawnPositions = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier(@, ModifierDeathWatchSpawnRandomDemon)
      for spawnPosition in spawnPositions
        cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn()
        if @spawnSilently
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        else
          spawnAction = new PlayCardAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

  getCardDataOrIndexToSpawn: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      possibleCardsToSpawn = [
        {id: Cards.Faction4.VorpalReaver},
        {id: Cards.Faction4.Moonrider},
        {id: Cards.Faction4.CreepDemon}
      ]
      if @getGameSession().getGameFormat() isnt GameFormat.Standard
        possibleCardsToSpawn.push(id: Cards.Faction4.Klaxon)
      return possibleCardsToSpawn[@getGameSession().getRandomIntegerForExecution(possibleCardsToSpawn.length)]
    return null

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierDeathWatchSpawnRandomDemon
