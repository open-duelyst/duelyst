CONFIG =     require 'app/common/config'
ModifierOverwatchMovedNearby = require './modifierOverwatchMovedNearby'
RandomTeleportAction = require '../actions/randomTeleportAction'
_ = require 'underscore'

class ModifierOverwatchMovedNearbyMoveBothToCorners extends ModifierOverwatchMovedNearby

  type:"ModifierOverwatchMovedNearbyMoveBothToCorners"
  @type:"ModifierOverwatchMovedNearbyMoveBothToCorners"

  onOverwatch: (action) ->
    # teleport enemy
    randomTeleportAction = new RandomTeleportAction(@getGameSession())
    randomTeleportAction.setOwnerId(@getCard().getOwnerId())
    randomTeleportAction.setSource(action.getSource())
    randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_CORNERS)
    randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(randomTeleportAction)

    # teleport self
    randomTeleportAction = new RandomTeleportAction(@getGameSession())
    randomTeleportAction.setOwnerId(@getCard().getOwnerId())
    randomTeleportAction.setSource(@getCard())
    randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_CORNERS)
    randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierOverwatchMovedNearbyMoveBothToCorners
