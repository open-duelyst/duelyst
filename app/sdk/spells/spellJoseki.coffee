Spell = require './spell'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellJoseki extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    opponentPlayer = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())

    opponentsDrawPile = opponentPlayer.getDeck().getDrawPile()
    myDrawPile = @getGameSession().getPlayerById(@getOwnerId()).getDeck().getDrawPile()
    opponentCard = @getGameSession().getCardByIndex(opponentsDrawPile[@getGameSession().getRandomIntegerForExecution(opponentsDrawPile.length)])
    myCard = @getGameSession().getCardByIndex(myDrawPile[@getGameSession().getRandomIntegerForExecution(myDrawPile.length)])

    if opponentCard?
      myNewCardData = opponentCard.createCardData()
      myNewCardData.ownerId = @getOwnerId() # reset owner id to player who will recieve this card
      removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), opponentCard.getIndex(), opponentPlayer.getPlayerId())
      @getGameSession().executeAction(removeCardFromDeckAction)
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), myNewCardData)
      @getGameSession().executeAction(putCardInHandAction)

    if myCard?
      opponentNewCardData = myCard.createCardData()
      opponentNewCardData.ownerId = opponentPlayer.getPlayerId() # reset owner id to player who will recieve this card
      removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), myCard.getIndex(), @getOwnerId())
      @getGameSession().executeAction(removeCardFromDeckAction)
      putCardInHandAction = new PutCardInHandAction(@getGameSession(),opponentPlayer.getPlayerId(), opponentNewCardData)
      @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellJoseki
