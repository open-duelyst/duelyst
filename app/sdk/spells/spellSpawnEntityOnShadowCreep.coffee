SpellSpawnEntity = require './spellSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellSpawnEntityOnShadowCreep extends SpellSpawnEntity

  _findApplyEffectPositions: (position, sourceAction) ->
    # filter to only positions with Shadow Creep
    finalPositions = []
    board = @getGameSession().getBoard()
    entityToSpawn = @getEntityToSpawn()
    for tile in board.getTiles(true)
      if tile? and tile.getBaseCardId() is Cards.Tile.Shadow and tile.getOwnerId() is @getOwnerId()
        pos = tile.getPosition()
        if !board.getObstructionAtPositionForEntity(pos, entityToSpawn)
          finalPositions.push(pos)

    return finalPositions

module.exports = SpellSpawnEntityOnShadowCreep
