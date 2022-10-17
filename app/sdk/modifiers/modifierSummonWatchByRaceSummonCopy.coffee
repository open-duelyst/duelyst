ModifierSummonWatch = require './modifierSummonWatch'
CONFIG = require 'app/common/config'
CloneEntityAction = require 'app/sdk/actions/cloneEntityAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class ModifierSummonWatchByRaceSummonCopy extends ModifierSummonWatch

  type:"ModifierSummonWatchByRaceSummonCopy"
  @type:"ModifierSummonWatchByRaceSummonCopy"

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  targetRaceId: null

  @createContextObject: (targetRaceId, options) ->
    contextObject = super(options)
    contextObject.targetRaceId = targetRaceId
    return contextObject

  onSummonWatch: (action) ->
    minion = action.getTarget()

    if minion? and !(action.getTriggeringModifier() instanceof ModifierSummonWatchByRaceSummonCopy)
      originalPosition = minion.getPosition()
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), originalPosition, CONFIG.PATTERN_3x3, minion, @getCard(), 1)
      if spawnLocations? and spawnLocations.length > 0
        spawnPosition = spawnLocations[0]
        spawnEntityAction = new CloneEntityAction(@getGameSession(), @getOwnerId(), spawnPosition.x, spawnPosition.y)
        spawnEntityAction.setOwnerId(@getOwnerId())
        spawnEntityAction.setSource(minion)
        @getGameSession().executeAction(spawnEntityAction)

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(@targetRaceId)

module.exports = ModifierSummonWatchByRaceSummonCopy
