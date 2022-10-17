SpellRemoveAndReplaceEntity = require './spellRemoveAndReplaceEntity'
ModifierTransformed = require 'app/sdk/modifiers/modifierTransformed'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class SpellAspectBase extends SpellRemoveAndReplaceEntity

  getCardDataOrIndexToSpawn: (x, y) ->
    cardDataOrIndexToSpawn = super(x, y)

    existingEntity = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, CardType.Entity)
    if existingEntity?
      if cardDataOrIndexToSpawn? and !_.isObject(cardDataOrIndexToSpawn) then cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
      cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierTransformed.createContextObject(existingEntity.getExhausted(), existingEntity.getMovesMade(), existingEntity.getAttacksMade()))

    return cardDataOrIndexToSpawn

module.exports = SpellAspectBase
