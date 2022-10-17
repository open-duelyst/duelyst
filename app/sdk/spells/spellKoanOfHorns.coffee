Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
RemoveCardFromHandAction = require 'app/sdk/actions/removeCardFromHandAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierCannotBeRemovedFromHand = require 'app/sdk/modifiers/modifierCannotBeRemovedFromHand'

class SpellKoanOfHorns extends Spell

  cardDataOrIndex: {id: Cards.Faction2.GoreHorn}

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    cardData = @cardDataOrIndex
    cardData.additionalModifiersContextObjects = [ModifierManaCostChange.createContextObject(-3)]
    # we're going to replace all UNITS in deck and hand with Gore Horns
    # first check all cards in player's hand
    for card, i in @getOwner().getDeck().getCardsInHand()
      if card? and card.getType() is CardType.Unit and !card.hasActiveModifierClass(ModifierCannotBeRemovedFromHand)
        removeCardFromHandAction = new RemoveCardFromHandAction(@getGameSession(), i, @getOwnerId())
        @getGameSession().executeAction(removeCardFromHandAction)
        putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), cardData)
        @getGameSession().executeAction(putCardInHandAction)

    # next check all cards in player's deck
    for card in @getOwner().getDeck().getCardsInDrawPile()
      if card? and card.getType() is CardType.Unit
        removeCardFromDeckAction = new RemoveCardFromDeckAction(@getGameSession(), card.getIndex(), @getOwnerId())
        @getGameSession().executeAction(removeCardFromDeckAction)
        putCardInDeckAction = new PutCardInDeckAction(@getGameSession(), @getOwnerId(), cardData)
        @getGameSession().executeAction(putCardInDeckAction)

module.exports = SpellKoanOfHorns
