SpellSpawnEntity = require './spellSpawnEntity'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellSummonDeadMinionOnHallowedGround extends SpellSpawnEntity

  canBeAppliedAnywhere: false
  spawnSilently: true

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.deadUnits = null
    return p

  getDeadUnits: () ->
    if !@_private.deadUnits?
      @_private.deadUnits = @getGameSession().getDeadUnits(@getOwnerId())
    return @_private.deadUnits

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      entities = @getDeadUnits()
      # find and spawn a dead unit
      if entities.length > 0
        entityToSpawn = entities[@getGameSession().getRandomIntegerForExecution(entities.length)]
        if entityToSpawn?
          @cardDataOrIndexToSpawn = entityToSpawn.createNewCardData()
          super(board,x,y,sourceAction)

  _postFilterPlayPositions: (validPositions) ->

    board = @getGameSession().getBoard()
    possibleSummonPositions = []

    for tile in board.getTiles(true, false)
      if tile.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == Cards.Tile.Hallowed
        tilePosition = {x:tile.getPosition().x, y:tile.getPosition().y}
        if !board.getCardAtPosition(tilePosition, CardType.Unit)
          possibleSummonPositions.push(tilePosition)

    # don't allow followup if there's nothing to re-summon or no unoccupied tiles
    if @getDeadUnits().length > 0 and possibleSummonPositions.length > 0
      return super(possibleSummonPositions)
    else
      return []


module.exports = SpellSummonDeadMinionOnHallowedGround
