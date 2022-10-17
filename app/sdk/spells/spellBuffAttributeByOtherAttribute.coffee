Logger = require 'app/common/logger'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
Modifier = require 'app/sdk/modifiers/modifier'
_ = require 'underscore'

class SpellBuffAttributeByOtherAttribute extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  attributeTarget: null #change this attribute
  attributeSource: null #change by the value of this attribute
  appliedName: null
  appliedDescription: null
  durationEndTurn: null
  durationStartTurn: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    entity = board.getCardAtPosition({x:x, y:y}, @targetType)
    attributeTargetAmount = 0

    switch @attributeSource
      when "hp" then  attributeTargetAmount = entity.getHP()
      when "maxHP" then attributeTargetAmount = entity.getMaxHP()
      when "atk" then attributeTargetAmount = entity.getATK()

    attributeBuffs = {}
    attributeBuffs[@attributeTarget] = attributeTargetAmount
    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellBuffAttributeByOtherAttribute::onApplyEffectToBoardTile -> #{x}, #{y} buff entity #{entity.getLogName()} attribute buffs by", attributeBuffs

    # apply modifier to buff attributes
    contextObject = Modifier.createContextObject()
    contextObject.attributeBuffs = attributeBuffs
    if @appliedName? then contextObject.appliedName = @appliedName
    if @appliedDescription? then contextObject.appliedDescription = @appliedDescription
    if @durationEndTurn? then contextObject.durationEndTurn = @durationEndTurn
    if @durationStartTurn? then contextObject.durationStartTurn = @durationStartTurn
    @getGameSession().applyModifierContextObject(contextObject, entity)

module.exports = SpellBuffAttributeByOtherAttribute
