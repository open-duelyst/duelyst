CONFIG = require 'app/common/config'
Spell =   require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup'

class SpellScionsSecondWish extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # draw 2 Vetruvian cards
    deck = @getOwner().getDeck()
    drawPile = deck.getDrawPile()
    indexOfCards = []
    for cardIndex, i in drawPile
      card = @getGameSession().getCardByIndex(cardIndex)
      if card? and card.getFactionId() == Factions.Faction3
        indexOfCards.push(i)

    for i in [0...2]
      if indexOfCards.length > 0
        whichCard = @getGameSession().getRandomIntegerForExecution(indexOfCards.length)
        indexOfCardInDeck = indexOfCards[whichCard]
        cardIndex = drawPile[indexOfCardInDeck]
        indexOfCards.splice(whichCard,1) # remove this card from the list (don't try to draw same card twice)
        # put card in hand
        putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardIndex)
        @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellScionsSecondWish
