Spell = require './spell'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierBanding = require 'app/sdk/modifiers/modifierBanding'
CardType = require 'app/sdk/cards/cardType'
ModifierImmuneToSpellsByEnemy = require 'app/sdk/modifiers/modifierImmuneToSpellsByEnemy'

class SpellRally extends Spell

  buffName: null

  _findApplyEffectPositions: (position, sourceAction) ->
    targetGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    targetGeneralPosition = targetGeneral.getPosition()

    applyEffectPositions = []
    if @getGameSession().getBoard().getUnitAtPosition({x: targetGeneralPosition.x + 1, y: targetGeneralPosition.y})
      applyEffectPositions.push({x: targetGeneralPosition.x + 1, y: targetGeneralPosition.y})
    if @getGameSession().getBoard().getUnitAtPosition({x: targetGeneralPosition.x - 1, y: targetGeneralPosition.y})
      applyEffectPositions.push({x: targetGeneralPosition.x - 1, y: targetGeneralPosition.y})
    return applyEffectPositions

  onApplyEffectToBoardTile: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    entity = board.getUnitAtPosition({x: x, y: y})
    if entity? and !entity.getIsGeneral() and entity.getOwnerId() is @getOwnerId()
      buff = Modifier.createContextObjectWithAttributeBuffs(2, 2)
      buff.appliedName = @buffName
      @getGameSession().applyModifierContextObject(buff, entity)
      if entity.hasActiveModifierClass(ModifierBanding)
        @getGameSession().applyModifierContextObject(ModifierImmuneToSpellsByEnemy.createContextObject(), entity)

module.exports = SpellRally
