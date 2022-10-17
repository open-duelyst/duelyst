CONFIG = require '../../common/config'
SpellCloneSourceEntity =   require('./spellCloneSourceEntity')
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'

###
  Spawns a new entity nearby my general as clone of another entity.
###
class SpellCloneSourceEntityNearbyGeneral extends SpellCloneSourceEntity

  _getPrefilteredValidTargetPositions: () ->
    # get positions around General
    return UtilsGameSession.getValidBoardPositionsFromPattern(@getGameSession().getBoard(), @getGameSession().getGeneralForPlayerId(@ownerId).getPosition(), CONFIG.PATTERN_3x3)

module.exports = SpellCloneSourceEntityNearbyGeneral
