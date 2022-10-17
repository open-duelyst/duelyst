ModifierDyingWish =  require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierDyingWishPutCardInHand extends ModifierDyingWish

  type:"ModifierDyingWishPutCardInHand"
  @type:"ModifierDyingWishPutCardInHand"

  @description:"Put %X in your Action Bar"

  cardDataOrIndexToPutInHand: null

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

  onDyingWish: () ->
    a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierDyingWishPutCardInHand
