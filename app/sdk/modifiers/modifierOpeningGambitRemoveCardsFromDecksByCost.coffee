ModifierOpeningGambit = require './modifierOpeningGambit'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitRemoveCardsFromDecksByCost extends ModifierOpeningGambit

  type: "ModifierOpeningGambitRemoveCardsFromDecksByCost"
  @type: "ModifierOpeningGambitRemoveCardsFromDecksByCost"

  manaCost: null
  affectMyDeck: true
  affectOppDeck: true

  @createContextObject: (manaCost, affectMyDeck = true, affectOppDeck = true, options) ->
    contextObject = super()
    contextObject.manaCost = manaCost
    contextObject.affectMyDeck = affectMyDeck
    contextObject.affectOppDeck = affectOppDeck

    return contextObject

  onOpeningGambit: () ->

    if @manaCost?
      if @affectMyDeck
        myDrawPile = @getOwner().getDeck().getDrawPile()
        for cardIndex, i in myDrawPile
          cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
          if cardAtIndex?.getManaCost() <= @manaCost and cardAtIndex.getType() == CardType.Unit
            removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), cardAtIndex.getIndex(), @getOwner().getPlayerId())
            @getGameSession().executeAction(removeCardFromDeckAction)

      if @affectOppDeck
        opponent = @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId())
        opponentDrawPile = opponent.getDeck().getDrawPile()
        for cardIndex, i in opponentDrawPile
          cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
          if cardAtIndex?.getManaCost() <= @manaCost and cardAtIndex.getType() == CardType.Unit
            removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), cardAtIndex.getIndex(), opponent.getPlayerId())
            @getGameSession().executeAction(removeCardFromDeckAction)

module.exports = ModifierOpeningGambitRemoveCardsFromDecksByCost
