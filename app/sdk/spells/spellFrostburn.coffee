SpellDamage = require './spellDamage'
Races = require 'app/sdk/cards/racesLookup'

class SpellFrostburn extends SpellDamage

  _postFilterApplyPositions: (originalPositions) ->
    filteredPositions = []
    for position in originalPositions
      if !@getGameSession().getBoard().getUnitAtPosition(position).getBelongsToTribe?(Races.Vespyr)
        filteredPositions.push(position)

    return filteredPositions

module.exports = SpellFrostburn
