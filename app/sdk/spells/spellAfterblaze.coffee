SpellApplyModifiers = require './spellApplyModifiers'
ModifierBanding = require 'app/sdk/modifiers/modifierBanding'

class SpellAfterblaze extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board, x, y, sourceAction) # apply modifier
    # draw a card if target had Zeal
    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    if entity.hasModifierClass(ModifierBanding) # if unit has Zeal
      @getGameSession().executeAction(@getOwner().getDeck().actionDrawCard())

module.exports = SpellAfterblaze
