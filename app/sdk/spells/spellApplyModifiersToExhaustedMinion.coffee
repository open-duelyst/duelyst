SpellApplyModifiers = require './spellApplyModifiers'

class SpellApplyModifiersToExhaustedMinion extends SpellApplyModifiers

  _postFilterPlayPositions: (validPositions) ->
    exhaustedMinionsPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and unit.getIsExhausted() is true
        exhaustedMinionsPositions.push(position)

    return exhaustedMinionsPositions


module.exports = SpellApplyModifiersToExhaustedMinion
