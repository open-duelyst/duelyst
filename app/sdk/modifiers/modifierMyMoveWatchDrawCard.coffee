Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
ModifierMyMoveWatch = require './modifierMyMoveWatch'

class ModifierMyMoveWatchDrawCard extends ModifierMyMoveWatch

  type:"ModifierMyMoveWatchDrawCard"
  @type:"ModifierMyMoveWatchDrawCard"

  @description: "After this moves, draw %X"

  @createContextObject: (numCards=1) ->
    contextObject = super()
    contextObject.numCards = numCards
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.numCards <= 1
        return @description.replace /%X/, "a card"
      else
        return @description.replace /%X/, modifierContextObject.numCards+" cards"
    else
      return @description

  onMyMoveWatch: (action) ->
    super()

    for i in [0...@numCards]
      deck = @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck()
      @getCard().getGameSession().executeAction(deck.actionDrawCard())


module.exports = ModifierMyMoveWatchDrawCard
