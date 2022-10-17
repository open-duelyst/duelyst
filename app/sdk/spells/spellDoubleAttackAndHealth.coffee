Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
Modifier = require 'app/sdk/modifiers/modifier'
_ = require 'underscore'

class SpellDoubleAttackAndHealth extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  modifierAppliedName: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    healthModContextObject = Modifier.createContextObjectWithAttributeBuffs(entity.getATK(), entity.getHP())
    if @modifierAppliedName?
      healthModContextObject.appliedName = @modifierAppliedName
    @getGameSession().applyModifierContextObject(healthModContextObject, entity)

module.exports = SpellDoubleAttackAndHealth
