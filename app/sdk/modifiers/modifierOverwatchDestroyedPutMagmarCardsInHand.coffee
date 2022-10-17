CardType = require '../cards/cardType'
ModifierOverwatchDestroyed = require './modifierOverwatchDestroyed'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
Factions = require 'app/sdk/cards/factionsLookup'
CardType = require 'app/sdk/cards/cardType'

class ModifierOverwatchDestroyedPutMagmarCardsInHand extends ModifierOverwatchDestroyed

  type:"ModifierOverwatchDestroyedPutMagmarCardsInHand"
  @type:"ModifierOverwatchDestroyedPutMagmarCardsInHand"

  @description: "When this minion is destroyed add two random Magmar spells with its mana cost to your action bar"

  onOverwatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      factionCards = @getGameSession().getCardCaches().getFaction(Factions.Faction5).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getType(CardType.Spell).getCards()
      factionCardsWithThisManaCost = [] # now filter faction cards for cards with same mana cost as this minion
      for card in factionCards
        if card.getManaCost() is @getCard().getManaCost()
          factionCardsWithThisManaCost.push(card)

      if factionCardsWithThisManaCost.length > 0 # possible there are no faction cards with correct mana cost, so verify before putting cards in hand
        cardToPutInHand = factionCardsWithThisManaCost[@getGameSession().getRandomIntegerForExecution(factionCardsWithThisManaCost.length)]
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardToPutInHand.createNewCardData())

        cardToPutInHand = factionCardsWithThisManaCost[@getGameSession().getRandomIntegerForExecution(factionCardsWithThisManaCost.length)]
        a2 = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardToPutInHand.createNewCardData())

        @getGameSession().executeAction(a)
        @getGameSession().executeAction(a2)

module.exports = ModifierOverwatchDestroyedPutMagmarCardsInHand
