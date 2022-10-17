SpellRefreshExhaustion = require './spellRefreshExhaustion'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'

class SpellRefreshFriendlyRanged extends SpellRefreshExhaustion

  _postFilterApplyPositions: (validPositions) ->

    filteredPositions = []

    board = @getGameSession().getBoard()
    for unit in board.getUnits(true, false)
      if unit?.getOwnerId() == @getOwnerId() and !unit.getIsGeneral() and unit.hasActiveModifierClass(ModifierRanged)
        position = unit.getPosition()
        filteredPositions.push(position)

    return filteredPositions

module.exports = SpellRefreshFriendlyRanged