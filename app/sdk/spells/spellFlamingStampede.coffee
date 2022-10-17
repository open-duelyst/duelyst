SpellDamage = require './spellDamage'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellFlamingStampede extends SpellDamage

  _postFilterApplyPositions: (originalPositions) ->
    filteredPositions = []
    for position in originalPositions
      if @getGameSession().getBoard().getUnitAtPosition(position).getBaseCardId() isnt Cards.Faction5.Egg
        filteredPositions.push(position)

    return filteredPositions

module.exports = SpellFlamingStampede
