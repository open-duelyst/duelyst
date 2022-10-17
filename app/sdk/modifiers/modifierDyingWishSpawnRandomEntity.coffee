ModifierDyingWishSpawnEntity = require './modifierDyingWishSpawnEntity'

class ModifierDyingWishSpawnRandomEntity extends ModifierDyingWishSpawnEntity

  type:"ModifierDyingWishSpawnRandomEntity"
  @type:"ModifierDyingWishSpawnRandomEntity"

  cardDataOrIndicesToSpawn: null # array of card data objects or indices to pick randomly from

  @createContextObject: (cardDataOrIndicesToSpawn, spawnDescription, spawnCount, spawnPattern, spawnSilently, options) ->
    contextObject = super(cardDataOrIndicesToSpawn[0], spawnDescription, spawnCount, spawnPattern, spawnSilently, options)
    contextObject.cardDataOrIndicesToSpawn = cardDataOrIndicesToSpawn
    return contextObject

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndicesToSpawn[@getGameSession().getRandomIntegerForExecution(@cardDataOrIndicesToSpawn.length)]

module.exports = ModifierDyingWishSpawnRandomEntity
