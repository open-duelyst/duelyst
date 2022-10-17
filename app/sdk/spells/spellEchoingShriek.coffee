SpellAspectBase = require './spellAspectBase.coffee'

class SpellEchoingShriek extends SpellAspectBase

  _postFilterApplyPositions: (validPositions) ->
    filteredPositions = []

    if validPositions.length > 0
      # spell only applies to minions with 2 or less cost
      for position in validPositions
        if @getGameSession().getBoard().getUnitAtPosition(position).getManaCost() <= 2
          filteredPositions.push(position)

    return filteredPositions

  module.exports = SpellEchoingShriek
