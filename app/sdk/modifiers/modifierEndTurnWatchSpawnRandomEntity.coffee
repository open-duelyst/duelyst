ModifierEndTurnWatchSpawnEntity = require './modifierEndTurnWatchSpawnEntity'

class ModifierEndTurnWatchSpawnRandomEntity extends ModifierEndTurnWatchSpawnEntity

  type:"ModifierEndTurnWatchSpawnRandomEntity"
  @type:"ModifierEndTurnWatchSpawnRandomEntity"

  cardDataOrIndicesToSpawn: null # array of card data objects or indices to pick randomly from

  @createContextObject: (cardDataOrIndicesToSpawn, spawnDescription, spawnCount, spawnPattern, spawnSilently, options) ->
    contextObject = super(cardDataOrIndicesToSpawn[0], spawnDescription, spawnCount, spawnPattern, spawnSilently, options)
    contextObject.cardDataOrIndicesToSpawn = cardDataOrIndicesToSpawn
    return contextObject

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndicesToSpawn[@getGameSession().getRandomIntegerForExecution(@cardDataOrIndicesToSpawn.length)]

module.exports = ModifierEndTurnWatchSpawnRandomEntity
