Spell = require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellNoshRakSpell extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    deck = @getGameSession().getPlayerById(@getOwnerId()).getDeck()

    numCardsNeeded = deck.getHand().length - deck.getHandExcludingMissing().length
    if numCardsNeeded > 0 # how many cards needed to fill hand?
      for i in [0...numCardsNeeded]
        # create a random vetruvian card
        vetCards = @getGameSession().getCardCaches().getFaction(Factions.Faction3).getIsHiddenInCollection(false).getIsToken(false).getIsGeneral(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        cardToDraw = vetCards[@getGameSession().getRandomIntegerForExecution(vetCards.length)]
        cardDataOrIndexToDraw = cardToDraw.createNewCardData()
        # reduce its cost to 0
        manaCostChangeContextObject = ModifierManaCostChange.createContextObject(0)
        manaCostChangeContextObject.attributeBuffsAbsolute = ["manaCost"]
        manaCostChangeContextObject.attributeBuffsFixed = ["manaCost"]
        cardDataOrIndexToDraw.additionalModifiersContextObjects = [manaCostChangeContextObject]
        # put it in hand
        a = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardDataOrIndexToDraw)
        @getGameSession().executeAction(a)

module.exports = SpellNoshRakSpell
