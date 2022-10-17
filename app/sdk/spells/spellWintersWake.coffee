SpellApplyModifiers = require './spellApplyModifiers.coffee'
ModifierWall = require 'app/sdk/modifiers/modifierWall'

class SpellWintersWake extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # this should be only applying to Walls
    card = @getGameSession().getBoard().getCardAtPosition({x:x, y:y})
    wallMod = card.getModifierByClass(ModifierWall)
    # allow this Wall to move
    if wallMod?
      wallMod.allowMove()

    super(board,x,y,sourceAction)

  _filterApplyPositions: (spellPositions) ->
    # applies only to Walls
    applyEffectPositions = super(spellPositions)
    finalApplyEffectPositions = []
    for position in applyEffectPositions
      card = @getGameSession().getBoard().getCardAtPosition(position)
      if card.hasModifierClass(ModifierWall)
        finalApplyEffectPositions.push(position)
    return finalApplyEffectPositions

module.exports = SpellWintersWake
