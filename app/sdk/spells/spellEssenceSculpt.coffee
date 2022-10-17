Spell = require './spell'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellEssenceSculpt extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getUnitAtPosition({x: x, y: y})

    # put a fresh card matching the original unit into hand
    newCardData = target.createNewCardData()
    # add additional modifiers as needed
    if @targetModifiersContextObjects
      if newCardData.additionalModifiersContextObjects?
        newCardData.additionalModifiersContextObjects.concat(UtilsJavascript.deepCopy(@targetModifiersContextObjects))
      else
        newCardData.additionalModifiersContextObjects = UtilsJavascript.deepCopy(@targetModifiersContextObjects)

    a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), newCardData)
    @getGameSession().executeAction(a)

  _postFilterPlayPositions: (validPositions) ->
    filteredPositions = []
    for position in validPositions
      entityAtPosition = @getGameSession().getBoard().getEntityAtPosition(position)
      if entityAtPosition? and entityAtPosition.hasModifierClass(ModifierStunned)
        filteredPositions.push(position)
    return filteredPositions

module.exports = SpellEssenceSculpt
