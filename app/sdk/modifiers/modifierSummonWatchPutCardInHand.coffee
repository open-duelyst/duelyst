ModifierSummonWatch = require './modifierSummonWatch'
PlayCardFromHandAction =     require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierSummonWatchPutCardInHand extends ModifierSummonWatch

  type:"ModifierSummonWatchPutCardInHand"
  @type:"ModifierSummonWatchPutCardInHand"

  @modifierName:"Summon Watch (put card in hand)"
  @description: "Whenever you summon a minion, you gain a %X in your Action bar"

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

  onSummonWatch: (action) ->
    a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), @cardDataOrIndexToPutInHand)
    @getGameSession().executeAction(a)

module.exports = ModifierSummonWatchPutCardInHand
