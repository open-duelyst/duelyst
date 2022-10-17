SpellSpawnEntity = require './spellSpawnEntity'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class SpellSpawnTilesInCenterColumn extends SpellSpawnEntity

  cardDataOrIndexToSpawn: null

  _findApplyEffectPositions: (position, sourceAction) ->

    board = @getGameSession().getBoard()
    centerPosition = {x: 4, y: 2}
    applyEffectPositions = []
    validSpawnLocations = UtilsGameSession.getValidBoardPositionsFromPattern(board, centerPosition, CONFIG.PATTERN_WHOLE_COLUMN, true)
    if validSpawnLocations?.length > 0
      for i in [0...validSpawnLocations.length]
        applyEffectPositions.push(validSpawnLocations[i])

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellSpawnTilesInCenterColumn
