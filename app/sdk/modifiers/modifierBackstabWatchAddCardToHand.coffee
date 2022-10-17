ModifierBackstabWatch = require './modifierBackstabWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierBackstabWatchAddCardToHand extends ModifierBackstabWatch

  type:"ModifierBackstabWatchAddCardToHand"
  @type:"ModifierBackstabWatchAddCardToHand"

  cardToAdd: null
  numToAdd: 0

  @createContextObject: (cardToAdd, numToAdd, options) ->
    contextObject = super(options)
    contextObject.cardToAdd = cardToAdd
    contextObject.numToAdd = numToAdd
    return contextObject

  onBackstabWatch: (action) ->

    for i in [0...@numToAdd]
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getOwnerId(), @cardToAdd)
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierBackstabWatchAddCardToHand
