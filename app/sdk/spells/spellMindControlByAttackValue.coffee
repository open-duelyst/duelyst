Logger = require 'app/common/logger'
SpellEnslave = require './spellEnslave'

class SpellMindControlByAttackValue extends SpellEnslave

  maxAttack: -1

  _postFilterPlayPositions: (validPositions) ->
    validTargetPositions = []

    if @maxAttack >= 0 # if maxAttack < 0, then don't any enemy unit is a valid target
      for position in validPositions
        unit = @getGameSession().getBoard().getUnitAtPosition(position)
        if unit? and unit.getATK() <= @maxAttack
          validTargetPositions.push(position)

    return validTargetPositions

module.exports = SpellMindControlByAttackValue
