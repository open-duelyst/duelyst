SpellKillTargetSpawnEntity = require './spellKillTargetSpawnEntity'
CardType = require 'app/sdk/cards/cardType'

class SpellWraithstorm extends SpellKillTargetSpawnEntity

  radius: 1 # default radius around general

  _postFilterApplyPositions: () ->
    board = @getGameSession().getBoard()
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    filteredPositions = []
    for unit in board.getEntitiesAroundEntity(myGeneral, CardType.Unit, @radius)
      if !(board.getUnitAtPosition(unit.getPosition())?.getIsGeneral()) # don't transform generals
        filteredPositions.push(unit.getPosition())

    return filteredPositions

module.exports = SpellWraithstorm
