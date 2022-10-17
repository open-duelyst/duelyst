SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
ModifierStunned =     require 'app/sdk/modifiers/modifierStunned'

class SpellYellRealLoud extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}

    targetEntity = board.getUnitAtPosition(applyEffectPosition)

    entities = board.getEnemyEntitiesAroundEntity(targetEntity, CardType.Unit, 1)
    for entity in entities
      if !entity.getIsGeneral()
        @getGameSession().applyModifierContextObject(ModifierStunned.createContextObject(), entity)

module.exports = SpellYellRealLoud
