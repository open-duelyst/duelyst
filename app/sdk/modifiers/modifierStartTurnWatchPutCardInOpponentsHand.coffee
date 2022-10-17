ModifierStartTurnWatch = require './modifierStartTurnWatch'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierStartTurnWatchPutCardInOpponentsHand extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchPutCardInOpponentsHand"
  @type:"ModifierStartTurnWatchPutCardInOpponentsHand"

  cardDataOrIndexToSpawn: null

  @description: "Add a card to your opponent's hand at start of turn"

  @createContextObject: (cardDataOrIndexToSpawn, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onTurnWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId()
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), general, card)
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierStartTurnWatchPutCardInOpponentsHand
