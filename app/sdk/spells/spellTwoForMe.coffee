Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Modifier = require 'app/sdk/modifiers/modifier'

class SpellTwoForMe extends Spell

  buffName: null

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()

      opponentPlayer = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())
      opponentsDrawPile = opponentPlayer.getDeck().getDrawPile()

      if opponentsDrawPile.length > 0
        indexesOfMinions = []
        for cardIndex, i in opponentsDrawPile
          card = @getGameSession().getCardByIndex(cardIndex)
          if card? and card.getType() == CardType.Unit
            indexesOfMinions.push(i)

        if indexesOfMinions.length > 0
          randomIndex = indexesOfMinions[@getGameSession().getRandomIntegerForExecution(indexesOfMinions.length)]
          cardToSteal = @getGameSession().getCardByIndex(opponentsDrawPile[randomIndex])

          if cardToSteal?
            newCardData = cardToSteal.createCloneCardData()
            newCardData.ownerId = @getOwnerId() # reset owner id to player who will recieve this card
            statContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
            statContextObject.appliedName = @buffName
            newCardData.additionalModifiersContextObjects ?= []
            newCardData.additionalModifiersContextObjects.push(statContextObject)

            removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), cardToSteal.getIndex(), opponentPlayer.getPlayerId())
            @getGameSession().executeAction(removeCardFromDeckAction)
            putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), newCardData)
            @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellTwoForMe
