ModifierEndTurnWatch = require './modifierEndTurnWatch.coffee'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class ModifierEndTurnWatchTeleportCorner extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchTeleportCorner"
  @type:"ModifierEndTurnWatchTeleportCorner"

  @modifierName:"Turn Watch"
  @description:"At the end of your turn, teleport to a random corner"

  isHiddenToUI: true # don't show this modifier by default

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

  onTurnWatch: (action) ->
    super(action)

    randomTeleportAction = new RandomTeleportAction(@getGameSession())
    randomTeleportAction.setOwnerId(@getCard().getOwnerId())
    randomTeleportAction.setSource(@getCard())
    randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_CORNERS)
    randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierEndTurnWatchTeleportCorner
