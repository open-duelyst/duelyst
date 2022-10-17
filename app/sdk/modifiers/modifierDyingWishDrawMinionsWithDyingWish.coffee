CardType = require 'app/sdk/cards/cardType'
ModifierDyingWish = require './modifierDyingWish'

class ModifierDyingWishDrawMinionsWithDyingWish extends ModifierDyingWish

  type:"ModifierDyingWishDrawMinionsWithDyingWish"
  @type:"ModifierDyingWishDrawMinionsWithDyingWish"

  @description: "Draw minions with a Dying Wish"

  numMinions: 0

  @createContextObject: (numMinions=0) ->
    contextObject = super()
    contextObject.numMinions = numMinions
    return contextObject

  onDyingWish: (action) ->
    super()

    gameSession = @getGameSession()
    if gameSession.getIsRunningAsAuthoritative()
      # calculate minions to draw on the server, since only the server knows contents of both decks
      if !cardIndicesToDraw
        cardIndicesToDraw = []

        # find indices of minions with Dying Wish
        drawPile = @getCard().getOwner().getDeck().getDrawPile()
        indexOfMinions = []
        for cardIndex, i in drawPile
          cardAtIndex = gameSession.getCardByIndex(cardIndex)
          if cardAtIndex? and cardAtIndex.getType() == CardType.Unit
            for kwClass in cardAtIndex.getKeywordClasses()
              if (kwClass.belongsToKeywordClass(ModifierDyingWish)) and (cardAtIndex.hasModifierClass(ModifierDyingWish))
                indexOfMinions.push(i)
                break

        # find X random dying wish minions
        for [0...@numMinions]
          if indexOfMinions.length > 0
            minionIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexOfMinions.length)
            indexOfCardInDeck = indexOfMinions[minionIndexToRemove]
            indexOfMinions.splice(minionIndexToRemove,1)
            cardIndicesToDraw.push(drawPile[indexOfCardInDeck])

      # put the random minions from deck into hand
      if cardIndicesToDraw and cardIndicesToDraw.length > 0
        for cardIndex in cardIndicesToDraw
          drawCardAction =  @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck().actionDrawCard(cardIndex)
          @getGameSession().executeAction(drawCardAction)

module.exports = ModifierDyingWishDrawMinionsWithDyingWish
