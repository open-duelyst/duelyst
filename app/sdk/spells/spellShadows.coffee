CONFIG = require 'app/common/config'
SpellSpawnEntity = require './spellSpawnEntity'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellShadows extends SpellSpawnEntity

  cardDataOrIndexToSpawn: {id: Cards.Faction4.Wraithling}

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []
    board = @getGameSession().getBoard()

    # apply in front of each enemy unit and General
    playerOffset = 0
    if @isOwnedByPlayer1() then playerOffset = 1 else playerOffset = -1
    entity = @getEntityToSpawn()
    for unit in board.getUnits()
      #look for units owned by the opponent of the player who cast the spell, and with an open space "behind" the enemy unit
      behindPosition = {x:unit.getPosition().x+playerOffset, y:unit.getPosition().y}
      if unit.getOwnerId() != @getOwnerId() and board.isOnBoard(behindPosition) and !board.getObstructionAtPositionForEntity(behindPosition, entity)
        applyEffectPositions.push(behindPosition)

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellShadows