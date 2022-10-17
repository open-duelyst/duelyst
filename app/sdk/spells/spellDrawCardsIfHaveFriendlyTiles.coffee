Spell = require './spell'

class SpellDrawCardsIfHaveFriendlyTiles extends Spell

  numCardsToDraw: 0
  numTilesRequired: 0
  tileId: null

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    numTiles = 0
    for tile in board.getTiles(true, false)
      if tile.getOwnerId() == @getOwnerId() and tile.getBaseCardId() == @tileId
        numTiles++
        if numTiles >= @numTilesRequired
          player = @getGameSession().getPlayerById(@getOwnerId())
          for [0...@numCardsToDraw]
            drawAction = player.getDeck().actionDrawCard()
            @getGameSession().executeAction(drawAction)
          break

module.exports = SpellDrawCardsIfHaveFriendlyTiles
