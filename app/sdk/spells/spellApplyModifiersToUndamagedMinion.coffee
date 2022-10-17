SpellApplyModifiers = require './spellApplyModifiers'

class SpellApplyModifiersToUndamagedMinion extends SpellApplyModifiers

  _postFilterPlayPositions: (validPositions) ->
    undamagedMinionsPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and unit.getHP() is unit.getMaxHP()
        undamagedMinionsPositions.push(position)

    return undamagedMinionsPositions


module.exports = SpellApplyModifiersToUndamagedMinion