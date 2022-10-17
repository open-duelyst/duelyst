SpellRemoveAndReplaceEntity = require './spellRemoveAndReplaceEntity'
ModifierRemoveAndReplaceEntity = require 'app/sdk/modifiers/modifierRemoveAndReplaceEntity'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'
_ = require("underscore")

class SpellTempTransform extends SpellRemoveAndReplaceEntity

  durationEndTurn: 0
  durationStartTurn: 0

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = super(x, y)

    existingEntity = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, CardType.Entity)
    if existingEntity?
      # create modifier from existing entity
      existingEntityCardData = existingEntity.createNewCardData()

      # create modifier to transform this entity back to its original form
      transformBackModifierContextObject = ModifierRemoveAndReplaceEntity.createContextObject(existingEntityCardData, existingEntity.getBaseCardId())
      transformBackModifierContextObject.durationEndTurn = @durationEndTurn
      transformBackModifierContextObject.durationStartTurn = @durationStartTurn
      transformBackModifierContextObject.isInherent = true
      if cardDataOrIndexToSpawn? and !_.isObject(cardDataOrIndexToSpawn) then cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(existingEntity.getExhausted(), existingEntity.getMovesMade(), existingEntity.getAttacksMade()))
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(transformBackModifierContextObject)

    return cardDataOrIndexToSpawn

module.exports = SpellTempTransform
