Logger = require 'app/common/logger'
SpellKillTarget = require './spellKillTarget'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'

class SpellKillTargetWithModifierRanged extends SpellKillTarget

  _postFilterPlayPositions: (validPositions) ->
    # use super filter play positions
    validPositions = super(validPositions)
    filteredValidPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and unit.hasActiveModifierClass(ModifierRanged)
        filteredValidPositions.push(position)

    return filteredValidPositions

module.exports = SpellKillTargetWithModifierRanged
