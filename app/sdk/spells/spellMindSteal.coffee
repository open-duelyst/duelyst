CONFIG = require 'app/common/config'
SpellSpawnEntity =   require './spellSpawnEntity'
CardType = require('app/sdk/cards/cardType')
SpellFilterType = require './spellFilterType'

class SpellMindSteal extends SpellSpawnEntity

  spellFilterType: SpellFilterType.SpawnSource
  spawnSilently: true

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.canConvertCardToPrismatic = false # stealing an actual card, so don't convert to prismatic based on this card

    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    opponentsDeck = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId()).getDeck()
    drawPile = opponentsDeck.getDrawPile()
    indexesOfMinions = []
    gameSession = @getGameSession()
    for cardIndex, i in drawPile
      if gameSession.getCardByIndex(cardIndex)?.getType() is CardType.Unit
        indexesOfMinions.push(i)

    if indexesOfMinions.length > 0
      indexOfCardInDeck = indexesOfMinions[@getGameSession().getRandomIntegerForExecution(indexesOfMinions.length)]
      @cardDataOrIndexToSpawn = drawPile[indexOfCardInDeck]

      super(board,x,y,sourceAction)

module.exports = SpellMindSteal
