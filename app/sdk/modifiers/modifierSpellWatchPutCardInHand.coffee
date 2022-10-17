Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
ModifierSpellWatch = require './modifierSpellWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierSpellWatchPutCardInHand extends ModifierSpellWatch

  type:"ModifierSpellWatchPutCardInHand"
  @type:"ModifierSpellWatchPutCardInHand"

  @modifierName:"Spell Watch (Put Card In Hand)"
  @description: "Whenever you play a spell, put a a card in your Action Bar"

  fxResource: ["FX.Modifiers.ModifierSpellWatch"]

  @createContextObject: (cardDataOrIndexToPutInHand, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToPutInHand = cardDataOrIndexToPutInHand
    return contextObject

  onSpellWatch: (action) ->
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierSpellWatchPutCardInHand