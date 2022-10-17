ModifierFriendlyDeathWatch = require './modifierFriendlyDeathWatch'
Races = require 'app/sdk/cards/racesLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierFriendlyDeathWatchForBattlePetDrawCard extends ModifierFriendlyDeathWatch

  type:"ModifierFriendlyDeathWatchForBattlePetDrawCard"
  @type:"ModifierFriendlyDeathWatchForBattlePetDrawCard"

  @description: "Whenever a friendly Battle Pet dies, draw %X"

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

  onFriendlyDeathWatch: (action) ->
    super()
    # if dying minion is a Battle Pet OR Ghoulie (Ghoulie belongs to all tribes)
    # need to look specifically for Ghoulie because his ability modifier is the thing that makes him belong to all tribes
    # and once he dies, his modifier is removed. Explicit check needed to work around this.
    if action.getTarget()?.getBelongsToTribe(Races.BattlePet) or action.getTarget()?.getBaseCardId() is Cards.Neutral.Ghoulie
      # draw a card
      for i in [0...@numCards]
        deck = @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck()
        @getCard().getGameSession().executeAction(deck.actionDrawCard())

module.exports = ModifierFriendlyDeathWatchForBattlePetDrawCard
