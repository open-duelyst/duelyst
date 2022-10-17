ModifierDeathWatch = require './modifierDeathWatch'
CardType = require 'app/sdk/cards/cardType'

class ModifierDeathWatchBuffMinionsInHand extends ModifierDeathWatch

  type:"ModifierDeathWatchBuffMinionsInHand"
  @type:"ModifierDeathWatchBuffMinionsInHand"

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericBuff"]

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.description = description
    return contextObject

  onDeathWatch: (action) ->

    cardsInHand = @getCard().getOwner().getDeck().getCardsInHandExcludingMissing()
    if cardsInHand?
      for card in cardsInHand
        if card?.getType() is CardType.Unit
          for modifierContextObject in @modifiersContextObjects
            @getGameSession().applyModifierContextObject(modifierContextObject, card)

module.exports = ModifierDeathWatchBuffMinionsInHand
