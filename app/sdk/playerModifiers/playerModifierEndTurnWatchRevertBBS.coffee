PlayerModifier = require './playerModifier'

class PlayerModifierEndTurnWatchRevertBBS extends PlayerModifier

  type:"PlayerModifierEndTurnWatchRevertBBS"
  @type:"PlayerModifierEndTurnWatchRevertBBS"

  bbsToRevertTo: null

  @createContextObject: (bbsToRevertTo) ->
    contextObject = super()
    contextObject.bbsToRevertTo = bbsToRevertTo
    return contextObject

  onEndTurn: (action) ->
    super(action)
    if @bbsToRevertTo?
      @getCard().setSignatureCardData(@bbsToRevertTo)
      @getGameSession().executeAction(@getCard().getOwner().actionGenerateSignatureCard())

module.exports = PlayerModifierEndTurnWatchRevertBBS
