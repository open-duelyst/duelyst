SpellFollowupTeleport = require './spellFollowupTeleport'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellFollowupTeleportToFriendlyCreep extends SpellFollowupTeleport

  _postFilterPlayPositions: (spellPositions) ->
    board = @getGameSession().getBoard()
    friendlyCreepPositions = []

    for tile in board.getTiles(true, false)
      if tile.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.Shadow
        tilePosition = {x:tile.getPosition().x, y:tile.getPosition().y}
        if !board.getCardAtPosition(tilePosition, CardType.Unit)
          friendlyCreepPositions.push(tilePosition)

    return friendlyCreepPositions

module.exports = SpellFollowupTeleportToFriendlyCreep
