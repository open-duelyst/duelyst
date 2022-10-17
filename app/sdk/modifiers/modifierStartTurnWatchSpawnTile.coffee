CONFIG = require 'app/common/config'
ModifierStartTurnWatchSpawnEntity = require './modifierStartTurnWatchSpawnEntity'
UtilsPosition = require 'app/common/utils/utils_position'

class ModifierStartTurnWatchSpawnTile extends ModifierStartTurnWatchSpawnEntity

  type:"ModifierStartTurnWatchSpawnTile"
  @type:"ModifierStartTurnWatchSpawnTile"

  @modifierName:"Turn Watch"
  @description:"At the start of your turn, turn %X"

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericSpawn"]

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

module.exports = ModifierStartTurnWatchSpawnTile
