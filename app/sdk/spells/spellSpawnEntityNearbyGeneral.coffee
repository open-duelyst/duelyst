CONFIG = require '../../common/config'
SpellSpawnEntity = require './spellSpawnEntity'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'

###
  Spawns a new entity nearby my general.
###
class SpellSpawnEntityNearbyGeneral extends SpellSpawnEntity

  _getPrefilteredValidTargetPositions: () ->
    # get positions around General
    return UtilsGameSession.getValidBoardPositionsFromPattern(@getGameSession().getBoard(), @getGameSession().getGeneralForPlayerId(@ownerId).getPosition(), CONFIG.PATTERN_3x3)

module.exports = SpellSpawnEntityNearbyGeneral
