Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
Modifier = require 'app/sdk/modifiers/modifier'

class SpellDoubleAttributeBuffs extends Spell

  appliedName: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, CardType.Unit)
    if entity?
      attackDifference = entity.getATK(true) - entity.getBaseATK()
      healthDifference = entity.getMaxHP(true) - entity.getBaseMaxHP()

      if attackDifference != 0 or healthDifference != 0
        buffContextObject = Modifier.createContextObjectWithAttributeBuffs(attackDifference, healthDifference)
        buffContextObject.appliedName = @appliedName
        @getGameSession().applyModifierContextObject(buffContextObject, entity)

module.exports = SpellDoubleAttributeBuffs
