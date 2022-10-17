CONFIG = require 'app/common/config'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierDyingWishSpawnEntity = require './modifierDyingWishSpawnEntity'

class ModifierDyingWishSpawnTile extends ModifierDyingWishSpawnEntity

  type:"ModifierDyingWishSpawnTile"
  @type:"ModifierDyingWishSpawnTile"

  @description: "Turn %X"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = ""
      if UtilsPosition.getArraysOfPositionsAreEqual(modifierContextObject.spawnPattern, CONFIG.PATTERN_1x1)
        replaceText = "this space into "+modifierContextObject.spawnDescription
      else if modifierContextObject.spawnCount == 1
        replaceText = "a "+modifierContextObject.spawnDescription+" in a random nearby space"
      else if modifierContextObject.spawnCount == 8
        replaceText = ""+modifierContextObject.spawnDescription+"s in all nearby spaces"
      else
        replaceText = ""+modifierContextObject.spawnDescription+"s into "+modifierContextObject.spawnCount+" nearby spaces"
      return @description.replace /%X/, replaceText
    else
      return @description

module.exports = ModifierDyingWishSpawnTile
