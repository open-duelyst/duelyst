Spell = require './spell'
Modifier = require 'app/sdk/modifiers/modifier'
CardType = require 'app/sdk/cards/cardType'

class SpellSwapStats extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # apply buff

    entity = board.getCardAtPosition({x:x, y:y}, CardType.Unit)

    if entity?
      # get current attack and health values WITHOUT aura contributions
      attack = entity.getATK(false)
      hp = entity.getHP(false)

      # apply a modifier that swaps current attack and health
      contextObject = Modifier.createContextObjectWithAttributeBuffs()
      # set the attribute buffs manually in case either one is 0
      contextObject.attributeBuffs.atk = hp
      contextObject.attributeBuffs.maxHP = attack
      contextObject.attributeBuffsAbsolute = ["atk", "maxHP"]
      contextObject.resetsDamage = true
      contextObject.isRemovable = false
      contextObject.appliedName = "Reversal"
      contextObject.appliedDescription = "This minion's Attack and Health were swapped."
      @getGameSession().applyModifierContextObject(contextObject, entity)

module.exports = SpellSwapStats
