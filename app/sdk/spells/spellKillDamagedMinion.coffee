SpellKillTarget = require './spellKillTarget'

class SpellKillDamagedMinion extends SpellKillTarget

  _postFilterPlayPositions: (validPositions) ->
    damagedMinionsPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and unit.getHP() < unit.getMaxHP()
        damagedMinionsPositions.push(position)

    return damagedMinionsPositions


module.exports = SpellKillDamagedMinion
