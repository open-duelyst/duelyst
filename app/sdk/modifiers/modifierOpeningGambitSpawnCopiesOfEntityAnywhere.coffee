CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit = require './modifierOpeningGambit'
DieAction = require 'app/sdk/actions/dieAction'
CloneEntityAction = require 'app/sdk/actions/cloneEntityAction'

class ModifierOpeningGambitSpawnCopiesOfEntityAnywhere extends ModifierOpeningGambit

  type:"ModifierOpeningGambitSpawnCopiesOfEntityAnywhere"
  @type:"ModifierOpeningGambitSpawnCopiesOfEntityAnywhere"

  @modifierName:"Opening Gambit"
  @description: "Summon %X"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (spawnDescription = "", spawnCount=1, options) ->
    contextObject = super(options)
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = ""
      if modifierContextObject.spawnCount == 1
        replaceText = ""+modifierContextObject.spawnDescription+" on a random space"
        return @description.replace /%X/, replaceText
      else if modifierContextObject.spawnCount > 1
        replaceText = ""+modifierContextObject.spawnDescription+" on random spaces"
        return @description.replace /%X/, replaceText
    else
      return @description

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      wholeBoardPattern = CONFIG.ALL_BOARD_POSITIONS
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, wholeBoardPattern, @getCard())
      for i in [0...@spawnCount]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        playCardAction = new CloneEntityAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitSpawnCopiesOfEntityAnywhere
