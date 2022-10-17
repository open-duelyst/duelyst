ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierTakeDamageWatchPutCardInHand extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchPutCardInHand"
  @type:"ModifierTakeDamageWatchPutCardInHand"


  @createContextObject: (cardDataOrIndexToPutInHand, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onDamageTaken: (action) ->
    super(action)
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierTakeDamageWatchPutCardInHand
