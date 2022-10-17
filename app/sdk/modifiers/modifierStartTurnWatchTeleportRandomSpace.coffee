ModifierStartTurnWatch = require './modifierStartTurnWatch'
UtilsGameSession = require 'app/common/utils/utils_game_session'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class ModifierStartTurnWatchTeleportRandomSpace extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchTeleportRandomSpace"
  @type:"ModifierStartTurnWatchTeleportRandomSpace"

  @description: "At the start of your turn, teleport to a random location"

  onTurnWatch: (action) ->
    super(action)

    randomTeleportAction = new RandomTeleportAction(@getGameSession())
    randomTeleportAction.setOwnerId(@getCard().getOwnerId())
    randomTeleportAction.setSource(@getCard())
    randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierStartTurnWatchTeleportRandomSpace
