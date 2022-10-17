CardType = require '../cards/cardType'
ModifierOverwatchEndTurn = require './modifierOverwatchEndTurn'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierOverwatchEndTurnPutCardInHand extends ModifierOverwatchEndTurn

  type:"ModifierOverwatchEndTurnPutCardInHand"
  @type:"ModifierOverwatchEndTurnPutCardInHand"

  @createContextObject: (numCards=0, options) ->
    contextObject = super(options)
    contextObject.numCards = numCards
    return contextObject

  onOverwatch: (action) ->
    for i in [0...@numCards]
      a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), {id: @getCard().getId()})
      this.getGameSession().executeAction(a)

module.exports = ModifierOverwatchEndTurnPutCardInHand
