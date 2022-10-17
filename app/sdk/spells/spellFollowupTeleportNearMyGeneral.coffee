SpellFollowupTeleport = require './spellFollowupTeleport'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class SpellFollowupTeleportNearMyGeneral extends SpellFollowupTeleport

  _postFilterPlayPositions: (spellPositions) ->
    # make sure that there is something to teleport at the source position
    if @getTeleportSource(@getApplyEffectPosition())?
      validPositions = []

      general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      if general?
        teleportLocations = UtilsGameSession.getValidBoardPositionsFromPattern(@getGameSession().getBoard(), general.getPosition(), CONFIG.PATTERN_3x3, false)
        for position in teleportLocations
          validPositions.push(position)

      return validPositions
    else
      return []

module.exports = SpellFollowupTeleportNearMyGeneral
