ModifierOpeningGambit =   require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOpeningGambitMindwarp extends ModifierOpeningGambit

  type:"ModifierOpeningGambitMindwarp"
  @type:"ModifierOpeningGambitMindwarp"

  @description:"Gain a copy of a random spell from your opponent\'s action bar"

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      # calculate card to steal only on the server, since only the server knows contents of both decks
      opponentPlayer = @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId())
      opponentDeck = opponentPlayer.getDeck()
      indicesOfOpponentSpellsInHand = []
      drawPile = opponentDeck.getHand()
      # check opponent's hand for spells
      for cardIndex, i in drawPile
        card = @getGameSession().getCardByIndex(cardIndex)
        if card? and card.getType() is CardType.Spell
          indicesOfOpponentSpellsInHand.push(i)

      # if there's a spell there, randomly choose one of the spells
      if indicesOfOpponentSpellsInHand.length > 0
        indexOfCardInHand = indicesOfOpponentSpellsInHand[@getGameSession().getRandomIntegerForExecution(indicesOfOpponentSpellsInHand.length)]
        opponentCardIndex = drawPile[indexOfCardInHand]
        opponentCard = @getGameSession().getCardByIndex(opponentCardIndex)
        # add the spell to the current player's hand in place of the unit they just summoned
        putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), opponentCard.createNewCardData())
        @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierOpeningGambitMindwarp
