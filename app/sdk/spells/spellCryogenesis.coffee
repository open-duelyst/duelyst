CONFIG = require 'app/common/config'
SpellDamage =   require './spellDamage'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
Races = require 'app/sdk/cards/racesLookup'

class SpellCryogenesis extends SpellDamage

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # draw a frost minion
    # calculate card to draw only on the server, since only the server knows contents of both decks
    deck = @getOwner().getDeck()
    drawPile = deck.getDrawPile()
    indexesOfMinions = []
    for cardIndex, i in drawPile
      # find only frost minions
      card = @getGameSession().getCardByIndex(cardIndex)
      if card? and card.getType() == CardType.Unit and card.getBelongsToTribe(Races.Vespyr)
        indexesOfMinions.push(i)

    if indexesOfMinions.length > 0
      indexOfCardInDeck = indexesOfMinions[@getGameSession().getRandomIntegerForExecution(indexesOfMinions.length)]
      cardIndex = drawPile[indexOfCardInDeck]
      drawCardAction =  @getGameSession().getPlayerById(@getOwner().getPlayerId()).getDeck().actionDrawCard(cardIndex)
      @getGameSession().executeAction(drawCardAction)

module.exports = SpellCryogenesis
