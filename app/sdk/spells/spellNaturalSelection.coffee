Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
SpellKillTarget = require './spellKillTarget'

###
  Spell that kills any 1 unit with lowest attack anywhere on the board (your choice which one when tied).
###
class SpellNaturalSelection extends SpellKillTarget

  _postFilterPlayPositions: (validPositions) ->
    # use super filter play positions
    validPositions = super(validPositions)
    filteredValidPositions = []

    # find all units with lowest attack value on the board
    lowestAttack = CONFIG.INFINITY
    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit?
        atk = unit.getATK()
        if atk < lowestAttack
          lowestAttack = atk
          # reset list of valid positions starting with the first unit that has the lowest atk
          filteredValidPositions = [unit.getPosition()]
        else if atk == lowestAttack
          # add unit position to valid positions as this unit matches current lowest atk
          filteredValidPositions.push(unit.getPosition())

    return filteredValidPositions


module.exports = SpellNaturalSelection
