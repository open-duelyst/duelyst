SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class SpellVoidSteal extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # apply modifier to target unit

    # then apply friendly modifier to friendly units nearby the target
    for unit in @getGameSession().getBoard().getCardsAroundPosition({x:x, y:y}, CardType.Unit, 1)
      if !unit.getIsGeneral() and unit.getOwnerId() is @getOwnerId()
        @getGameSession().applyModifierContextObject(@allyBuffContextObject, unit)

module.exports = SpellVoidSteal
