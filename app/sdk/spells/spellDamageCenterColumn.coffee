SpellDamage = require './spellDamage'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class SpellDamageCenterColumn extends SpellDamage

  _findApplyEffectPositions: (position, sourceAction) ->
    
    board = @getGameSession().getBoard()
    centerPosition = {x: 4, y: 2}
    applyEffectPositions = []
    validDamageLocations = UtilsGameSession.getValidBoardPositionsFromPattern(board, centerPosition, CONFIG.PATTERN_WHOLE_COLUMN, true)
    if validDamageLocations?.length > 0
      for i in [0...validDamageLocations.length]
        location = validDamageLocations[i]
        unit = board.getUnitAtPosition(location)
        if unit?
          applyEffectPositions.push(location)

    return applyEffectPositions

module.exports = SpellDamageCenterColumn
