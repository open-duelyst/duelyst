Logger = require 'app/common/logger'
SpellRefreshExhaustion = require './spellRefreshExhaustion'

class SpellInnerFocus extends SpellRefreshExhaustion

  maxAttack: -1

  _postFilterPlayPositions: (validPositions) ->
    validTargetPositions = []

    if @maxAttack >= 0 # if maxAttack < 0, then any card is a valid target
      for position in validPositions
        unit = @getGameSession().getBoard().getUnitAtPosition(position)
        if unit? and unit.getATK() <= @maxAttack and !unit.getIsBattlePet()
          validTargetPositions.push(position)

    return validTargetPositions

module.exports = SpellInnerFocus
