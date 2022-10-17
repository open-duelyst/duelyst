Logger = require 'app/common/logger'
SpellKillTarget = require './spellKillTarget'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'

class SpellKillTargetWithModifierStunned extends SpellKillTarget

  _postFilterPlayPositions: (validPositions) ->
    # use super filter play positions
    validPositions = super(validPositions)
    filteredValidPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and unit.hasActiveModifierClass(ModifierStunned)
        filteredValidPositions.push(position)

    return filteredValidPositions

module.exports = SpellKillTargetWithModifierStunned
