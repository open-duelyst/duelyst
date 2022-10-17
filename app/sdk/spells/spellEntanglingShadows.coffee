SpellSpawnEntity =   require './spellSpawnEntity.coffee'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
Races = require 'app/sdk/cards/racesLookup.coffee'
PlayCardAction = require 'app/sdk/actions/playCardAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellEntanglingShadows extends SpellSpawnEntity

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}

    # always spawn a shadow tile at each position
    if board.isOnBoard(applyEffectPosition)
      action = new PlayCardAction(@getGameSession(), @getOwnerId(), x, y, {id: Cards.Tile.Shadow})
      action.setOwnerId(@getOwnerId())
      @getGameSession().executeAction(action)

    # spawn random battle pet
    spawnAction = @getSpawnAction(x, y, @cardDataOrIndexToSpawn)
    if spawnAction?
      @getGameSession().executeAction(spawnAction)

module.exports = SpellEntanglingShadows
