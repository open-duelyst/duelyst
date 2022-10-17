ModifierDyingWish =  require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierDyingWishPutCardInOpponentHand extends ModifierDyingWish

  type:"ModifierDyingWishPutCardInOpponentHand"
  @type:"ModifierDyingWishPutCardInOpponentHand"

  cardDataOrIndexToPutInHand: null

  @createContextObject: (cardDataOrIndexToPutInHand, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onDyingWish: () ->
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId()
    a = new PutCardInHandAction(@getGameSession(), general, @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierDyingWishPutCardInOpponentHand
