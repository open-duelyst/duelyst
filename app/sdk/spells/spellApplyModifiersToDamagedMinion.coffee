SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
_ = require 'underscore'

class SpellApplyModifiersToDamagedMinion extends SpellApplyModifiers

  _postFilterPlayPositions: (validPositions) ->
    damagedMinionsPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      if unit? and unit.getHP() < unit.getMaxHP()
        damagedMinionsPositions.push(position)

    return damagedMinionsPositions


module.exports = SpellApplyModifiersToDamagedMinion
