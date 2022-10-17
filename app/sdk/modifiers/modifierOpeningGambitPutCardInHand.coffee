ModifierOpeningGambit = require './modifierOpeningGambit'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOpeningGambitPutCardInHand extends ModifierOpeningGambit

  type:"ModifierOpeningGambitPutCardInHand"
  @type:"ModifierOpeningGambitPutCardInHand"

  cardDataOrIndexToPutInHand: null

  @createContextObject: (cardDataOrIndexToPutInHand, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onOpeningGambit: (action) ->
    super(action)
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitPutCardInHand
