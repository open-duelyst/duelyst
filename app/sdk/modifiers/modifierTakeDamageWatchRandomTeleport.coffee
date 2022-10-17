ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
_ = require 'underscore'

class ModifierTakeDamageWatchRandomTeleport extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchRandomTeleport"
  @type:"ModifierTakeDamageWatchRandomTeleport"

  @description:"Whenever this minion takes damage, it randomly teleports"

  onDamageTaken: (action) ->
    super(action)

    randomTeleportAction = new RandomTeleportAction(@getGameSession())
    randomTeleportAction.setOwnerId(@getCard().getOwnerId())
    randomTeleportAction.setSource(@getCard())
    randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierTakeDamageWatchRandomTeleport
