ModifierSynergize = require './modifierSynergize'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierSynergizePutCardInHand extends ModifierSynergize

  type:"ModifierSynergizePutCardInHand"
  @type:"ModifierSynergizePutCardInHand"

  fxResource: ["FX.Modifiers.ModifierSynergize"]

  cardDataOrIndexToPutInHand: null

  @createContextObject: (cardDataOrIndexToPutInHand, options=undefined) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onSynergize: (action) ->
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierSynergizePutCardInHand
