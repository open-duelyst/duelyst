ModifierSpellDamageWatch = require './modifierSpellDamageWatch'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierSpellDamageWatchPutCardInHand extends ModifierSpellDamageWatch

  type:"ModifierSpellDamageWatchPutCardInHand"
  @type:"ModifierSpellDamageWatchPutCardInHand"

  @createContextObject: (cardDataOrIndexToPutInHand, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onDamagingSpellcast: (action) ->
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierSpellDamageWatchPutCardInHand
