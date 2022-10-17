PlayerModifierSummonWatchFromActionBar = require './playerModifierSummonWatchFromActionBar'
CardType = require 'app/sdk/cards/cardType'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'

class PlayerModifierSummonWatchIfFlyingDrawFlyingMinion extends PlayerModifierSummonWatchFromActionBar

  type:"PlayerModifierSummonWatchIfFlyingDrawFlyingMinion"
  @type:"PlayerModifierSummonWatchIfFlyingDrawFlyingMinion"

  onSummonWatch: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()
      cardSummoned = action.getTarget()
      if cardSummoned? and cardSummoned.hasModifierClass(ModifierFlying)
        cardIndexToDraw = null

        # find all flying minions in the deck
        drawPile = @getOwner().getDeck().getDrawPile()
        indexOfFlyingMinions = []
        for cardIndex, i in drawPile
          cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
          if cardAtIndex?.getType() == CardType.Unit
            if cardAtIndex.hasModifierClass(ModifierFlying)
              indexOfFlyingMinions.push(i)

        if indexOfFlyingMinions.length > 0
          minionIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexOfFlyingMinions.length)
          indexOfCardInDeck = indexOfFlyingMinions[minionIndexToRemove]
          cardIndexToDraw = drawPile[indexOfCardInDeck]

          # create put card in hand action
          if cardIndexToDraw?
            card = @getGameSession().getCardByIndex(cardIndexToDraw)
            drawCardAction = @getGameSession().getPlayerById(@getOwner().getPlayerId()).getDeck().actionDrawCard(cardIndexToDraw)
            drawCardAction.isDepthFirst = true
            @getGameSession().executeAction(drawCardAction)

module.exports = PlayerModifierSummonWatchIfFlyingDrawFlyingMinion
