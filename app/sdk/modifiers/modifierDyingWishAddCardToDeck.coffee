ModifierDyingWish =  require './modifierDyingWish'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'

class ModifierDyingWishAddCardToDeck extends ModifierDyingWish

  type:"ModifierDyingWishAddCardToDeck"
  @type:"ModifierDyingWishAddCardToDeck"

  cardData: null

  @createContextObject: (cardData, options) ->
    contextObject = super(options)
    contextObject.cardData = cardData
    return contextObject

  onDyingWish: () ->
    if @cardData?
      @cardData.ownerId = @getOwnerId()
      putCardInDeckAction = new PutCardInDeckAction(@getGameSession(), @getOwnerId(), @cardData)
      @getGameSession().executeAction(putCardInDeckAction)

module.exports = ModifierDyingWishAddCardToDeck
