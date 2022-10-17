CONFIG = require 'app/common/config'
ModifierEndTurnWatchSpawnEntity = require './modifierEndTurnWatchSpawnEntity'
UtilsPosition = require 'app/common/utils/utils_position'

class ModifierEndTurnWatchSpawnTile extends ModifierEndTurnWatchSpawnEntity

  type:"ModifierEndTurnWatchSpawnTile"
  @type:"ModifierEndTurnWatchSpawnTile"

  @modifierName:"Turn Watch"
  @description:"At the end of your turn, turn %X"

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = ""
      if UtilsPosition.getArraysOfPositionsAreEqual(modifierContextObject.spawnPattern, CONFIG.PATTERN_1x1)
        replaceText = "its space into "+modifierContextObject.spawnDescription
      else if modifierContextObject.spawnCount == 1
        replaceText = "a nearby space into "+modifierContextObject.spawnDescription
      else if modifierContextObject.spawnCount == 8
        replaceText = "all nearby spaces into "+modifierContextObject.spawnDescription
      else
        replaceText = modifierContextObject.spawnCount+" nearby spaces into "+modifierContextObject.spawnDescription
      return @description.replace /%X/, replaceText
    else
      return @description

module.exports = ModifierEndTurnWatchSpawnTile
