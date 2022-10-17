ModifierEndTurnWatchAnyPlayer = require './modifierEndTurnWatchAnyPlayer'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class ModifierEndTurnWatchAnyPlayerPullRandomUnits extends ModifierEndTurnWatchAnyPlayer

  type: "ModifierEndTurnWatchAnyPlayerPullRandomUnits"
  @type: "ModifierEndTurnWatchAnyPlayerPullRandomUnits"

  onTurnWatch: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()

      entities = @getGameSession().getBoard().getUnits(true)
      potentialTargets = []
      for entity in entities
        if entity? and !@positionsAreNearby(entity.getPosition(), @getCard().getPosition())
          potentialTargets.push(entity)

      if potentialTargets.length > 0
        numTargets = 1
        while Math.random() > .5 and numTargets < potentialTargets.length
          numTargets++
        for [0...numTargets]
          unitToTeleport = potentialTargets.splice(@getGameSession().getRandomIntegerForExecution(potentialTargets.length), 1)[0]
          randomTeleportAction = new RandomTeleportAction(@getGameSession())
          randomTeleportAction.setOwnerId(@getCard().getOwnerId())
          randomTeleportAction.setSource(unitToTeleport)
          randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
          randomTeleportAction.setPatternSourcePosition(@getCard().getPosition())
          randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_3x3)
          @getGameSession().executeAction(randomTeleportAction)

  positionsAreNearby: (position1, position2) ->
    if (Math.abs(position1.x - position2.x) <= 1) and (Math.abs(position1.y - position2.y) <= 1)
      return true
    return false

module.exports = ModifierEndTurnWatchAnyPlayerPullRandomUnits
