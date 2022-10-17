ModifierOpeningGambit = require './modifierOpeningGambit'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOpeningGambitPutCardInOpponentHand extends ModifierOpeningGambit

  type:"ModifierOpeningGambitPutCardInOpponentHand"
  @type:"ModifierOpeningGambitPutCardInOpponentHand"

  @description:"Put %X in your opponent's action bar"

  @createContextObject: (cardDataOrIndexToPutInHand, cardDescription,options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    contextObject.cardDescription = cardDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.cardDescription
    else
      return @description

  onOpeningGambit: (action) ->
    super(action)
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitPutCardInOpponentHand
