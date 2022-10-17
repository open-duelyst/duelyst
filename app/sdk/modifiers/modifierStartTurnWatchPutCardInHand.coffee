ModifierStartTurnWatch = require './modifierStartTurnWatch'
KillAction = require 'app/sdk/actions/killAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierStartTurnWatchPutCardInHand extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchPutCardInHand"
  @type:"ModifierStartTurnWatchPutCardInHand"

  cardData: null

  @description: "Add a card to your hand at start of turn"

  @createContextObject: (cardData, options) ->
    contextObject = super(options)
    contextObject.cardData = cardData
    return contextObject

  onTurnWatch: (action) ->
    putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), @cardData)
    @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierStartTurnWatchPutCardInHand
