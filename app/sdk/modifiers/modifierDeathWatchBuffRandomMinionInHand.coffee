Modifier = require './modifier'
ModifierDeathWatch = require './modifierDeathWatch'
CardType = require 'app/sdk/cards/cardType'

class ModifierDeathWatchBuffRandomMinionInHand extends ModifierDeathWatch

  type:"ModifierDeathWatchBuffRandomMinionInHand"
  @type:"ModifierDeathWatchBuffRandomMinionInHand"

  @description: "Give a minion in your hand %X"

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericBuff"]

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, description, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.description = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onDeathWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      possibleMinions = []
      for card in @getCard().getOwner().getDeck().getCardsInHandExcludingMissing()
        if card.getType() is CardType.Unit
          possibleMinions.push(card)
      if possibleMinions.length > 0
        cardToBuff = possibleMinions[@getGameSession().getRandomIntegerForExecution(possibleMinions.length)]
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, cardToBuff)

module.exports = ModifierDeathWatchBuffRandomMinionInHand
