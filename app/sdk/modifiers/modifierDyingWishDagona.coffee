ModifierDyingWishSpawnEntity = require './modifierDyingWishSpawnEntity'

class ModifierDyingWishDagona extends ModifierDyingWishSpawnEntity

  type:"ModifierDyingWishDagona"
  @type:"ModifierDyingWishDagona"

  spawnOwnerId: null

  createContextObjectForClone: (contextObject) ->
    cloneContextObject = super(contextObject)
    cloneContextObject.spawnOwnerId = @spawnOwnerId
    cloneContextObject.cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
    return cloneContextObject

  setCardDataOrIndexToSpawn: (cardDataOrIndexToSpawn) ->
    @cardDataOrIndexToSpawn = cardDataOrIndexToSpawn

  setSpawnOwnerId: (ownerId) ->
    @spawnOwnerId = ownerId

  getSpawnOwnerId: (action) ->
    if @spawnOwnerId?
      return @spawnOwnerId
    else
      return super(action)

module.exports = ModifierDyingWishDagona
