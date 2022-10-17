Spell = require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'

class SpellHatchAnEgg extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    eggModifier = board.getCardAtPosition({x:x, y:y}).getModifierByClass(ModifierEgg)
    if eggModifier?
      @getGameSession().pushTriggeringModifierOntoStack(eggModifier)
      eggModifier.removeAndReplace()
      @getGameSession().popTriggeringModifierFromStack()

  _postFilterPlayPositions: (validPositions) ->
    # playable anywhere where an egg exists
    # but NOT a dispelled egg (dispelled egg cannot hatch)
    filteredPositions = []
    for position in validPositions
      entityAtPosition = @getGameSession().getBoard().getEntityAtPosition(position)
      if entityAtPosition? and entityAtPosition.hasModifierClass(ModifierEgg)
        filteredPositions.push(position)
    return filteredPositions

module.exports = SpellHatchAnEgg
