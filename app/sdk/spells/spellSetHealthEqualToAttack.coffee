Logger = require 'app/common/logger'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
Modifier = require 'app/sdk/modifiers/modifier'
_ = require 'underscore'

class SpellSetHealthEqualToAttack extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  appliedName: null
  appliedDescription: null
  durationEndTurn: null
  durationStartTurn: null

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    entity = board.getCardAtPosition({x:x, y:y}, @targetType)

    # apply modifier to change health
    contextObject = Modifier.createContextObject()
    contextObject.attributeBuffs = {}
    contextObject.attributeBuffs.maxHP = entity.getATK(true)
    contextObject.attributeBuffsAbsolute = ["maxHP"]
    contextObject.resetsDamage = true
    contextObject.isRemovable = false
    if @appliedName? then contextObject.appliedName = @appliedName
    if @appliedDescription? then contextObject.appliedDescription = @appliedDescription
    if @durationEndTurn? then contextObject.durationEndTurn = @durationEndTurn
    if @durationStartTurn? then contextObject.durationStartTurn = @durationStartTurn
    @getGameSession().applyModifierContextObject(contextObject, entity)

module.exports = SpellSetHealthEqualToAttack
