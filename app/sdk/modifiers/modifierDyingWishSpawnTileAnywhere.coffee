ModifierDyingWishSpawnEntityAnywhere = require './modifierDyingWishSpawnEntityAnywhere'

class ModifierDyingWishSpawnTileAnywhere extends ModifierDyingWishSpawnEntityAnywhere

  type:"ModifierDyingWishSpawnTileAnywhere"
  @type:"ModifierDyingWishSpawnTileAnywhere"

  @description: "Turn %X"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.spawnDescription
    else
      return @description

module.exports = ModifierDyingWishSpawnTileAnywhere
