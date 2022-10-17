CONFIG = require 'app/common/config'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
_ = require 'underscore'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellFillHandFromOpponentsDeck extends Spell

  spellFilterType: SpellFilterType.NeutralIndirect

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    #get number of empty slots in hand I need to Fill
    emptySlots = 0
    myHand = @getGameSession().getPlayerById(@getOwnerId()).getDeck().getHand()
    for card in myHand
      if card is null or card is undefined
        emptySlots++

    if emptySlots > 0
      cardIndices = [] #first create indices of the cards we want to take from the opponent's deck
      for i in [1..emptySlots]
        opponentPlayer = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())
        opponentsDrawPile = opponentPlayer.getDeck().getDrawPile()
        if opponentsDrawPile.length > 0
          randomIndex = @getGameSession().getRandomIntegerForExecution(opponentsDrawPile.length)
          opponentCard = @getGameSession().getCardByIndex(opponentsDrawPile[randomIndex])
          cardIndices.push(opponentCard)
          opponentsDrawPile.splice(randomIndex, 1)

      #then we can cycle through those indices without worrying about the same instance of a card being chosen multiple times
      if cardIndices.length > 0
        for newCard in cardIndices
          if opponentCard?
            myNewCardData = newCard.createCardData()
            myNewCardData.ownerId = @getOwnerId() # reset owner id to player who will recieve this card
            removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), newCard.getIndex(), opponentPlayer.getPlayerId())
            @getGameSession().executeAction(removeCardFromDeckAction)
            putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), myNewCardData)
            @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellFillHandFromOpponentsDeck
