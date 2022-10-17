SpellSpawnEntity = require './spellSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookup'

class SpellInklingSurge extends SpellSpawnEntity

  onApplyToBoard: (board,x,y,sourceAction) ->

    for entity in board.getEntities(true, false)
      if entity.getOwnerId() is @getOwnerId() and entity.getBaseCardId() == Cards.Faction4.Wraithling
        @getGameSession().executeAction(@getOwner().getDeck().actionDrawCard())
        break

    super(board,x,y,sourceAction)

module.exports = SpellInklingSurge
