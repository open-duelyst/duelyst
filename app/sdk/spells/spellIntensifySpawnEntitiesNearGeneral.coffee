SpellIntensify = require './spellIntensify'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'

class SpellIntensifySpawnEntitiesNearGeneral extends SpellIntensify

  cardDataOrIndexToSpawn: null
  numberToSummon: 1

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative() and @cardDataOrIndexToSpawn?

      myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      totalNumberToSpawn = @numberToSummon * @getIntensifyAmount()
      card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(@cardDataOrIndexToSpawn)
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), myGeneral.getPosition(), CONFIG.PATTERN_3x3, card, @, totalNumberToSpawn)

      for location in spawnLocations
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), location.x, location.y, @cardDataOrIndexToSpawn)
        spawnAction.setSource(@)
        @getGameSession().executeAction(spawnAction)

module.exports = SpellIntensifySpawnEntitiesNearGeneral
