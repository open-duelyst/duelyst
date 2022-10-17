Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellRequireUnoccupiedFriendlyCreep extends Spell

  _postFilterPlayPositions: (spellPositions) ->

    board = @getGameSession().getBoard()

    for tile in board.getTiles(true, false)
      if tile.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.Shadow
        tilePosition = {x:tile.getPosition().x, y:tile.getPosition().y}
        if !board.getCardAtPosition(tilePosition, CardType.Unit)
          #there is at least 1 unoccupied friendly creep tile
          return super(spellPositions)

    #No unoccupied friendly creep
    return []

module.exports = SpellRequireUnoccupiedFriendlyCreep
