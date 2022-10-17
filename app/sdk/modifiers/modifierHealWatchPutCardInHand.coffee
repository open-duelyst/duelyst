ModifierHealWatch = require './modifierHealWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierHealWatchPutCardInHand extends ModifierHealWatch

  type:"ModifierHealWatchPutCardInHand"
  @type:"ModifierHealWatchPutCardInHand"

  @modifierName:"ModifierHealWatchPutCardInHand"
  @description:"Whenever anything is healed, put %X into your action bar"

  fxResource: ["FX.Modifiers.ModifierFriendlyMinionHealWatch"]

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

  onHealWatch: (action) ->
    a = new PutCardInHandAction(this.getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    this.getGameSession().executeAction(a)

module.exports = ModifierHealWatchPutCardInHand
