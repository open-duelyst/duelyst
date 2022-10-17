SpellKillTarget = require './spellKillTarget'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellKillEnemyOnFriendlyCreep extends SpellKillTarget

  _postFilterPlayPositions: (spellPositions) ->
    board = @getGameSession().getBoard()
    possibleTargetPositions = []

    for tile in board.getTiles(true, false)
      if tile.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.Shadow
        tilePosition = {x:tile.getPosition().x, y:tile.getPosition().y}
        unitOnCreep = board.getCardAtPosition(tilePosition, CardType.Unit)
        if unitOnCreep? and unitOnCreep.getOwnerId() != @getOwnerId() and !unitOnCreep.getIsGeneral()
          possibleTargetPositions.push(tilePosition)

    return possibleTargetPositions

module.exports = SpellKillEnemyOnFriendlyCreep
