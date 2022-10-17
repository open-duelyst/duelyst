ModifierOpeningGambit = require './modifierOpeningGambit'

class ModifierOpeningGambitDrawCopyFromDeck extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDrawCopyFromDeck"
  @type: "ModifierOpeningGambitDrawCopyFromDeck"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->

    drawPile = @getOwner().getDeck().getDrawPile()
    indexOfCard = -1
    cardFound = false

    for cardIndex, i in drawPile
      cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
      if cardAtIndex?.getBaseCardId() == @getCard().getBaseCardId()
        indexOfCard = i
        cardFound = true
        break

    if cardFound
      cardIndexToDraw = drawPile[i]
      if cardIndexToDraw?
        card = @getGameSession().getCardByIndex(cardIndexToDraw)
        drawCardAction = @getGameSession().getPlayerById(@getOwner().getPlayerId()).getDeck().actionDrawCard(cardIndexToDraw)
        drawCardAction.isDepthFirst = true
        @getGameSession().executeAction(drawCardAction)

module.exports = ModifierOpeningGambitDrawCopyFromDeck
