PlayerModifierEmblem = require './playerModifierEmblem'
EndTurnAction = require 'app/sdk/actions/endTurnAction'

class PlayerModifierEmblemEndTurnWatch extends PlayerModifierEmblem

  type:"PlayerModifierEmblemEndTurnWatch"
  @type:"PlayerModifierEmblemEndTurnWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

  activeOnMyTurn: true
  activeOnEnemyTurn: false

  @createContextObject: (activeOnMyTurn=true, activeOnEnemyTurn=false, options) ->
    contextObject = super(options)
    contextObject.activeOnMyTurn = activeOnMyTurn
    contextObject.activeOnEnemyTurn = activeOnEnemyTurn
    return contextObject

  onActivate: () ->
    super()
    # trigger when applied during end of turn
    # but only if this was not applied as a result of the card being played
    if @getGameSession().getCurrentTurn().getEnded()
      executingAction = @getGameSession().getExecutingAction()
      endTurnAction = executingAction.getMatchingAncestorAction(EndTurnAction)
      if endTurnAction?
        playedByAction = @getCard().getAppliedToBoardByAction()
        if !playedByAction?
          @onTurnWatch(endTurnAction)
        else if playedByAction.getIndex() < endTurnAction.getIndex()
          @onTurnWatch(executingAction)

  onEndTurn: (e) ->
    super(e)
    if (@activeOnMyTurn && @getGameSession().getCurrentPlayer().getPlayerId() == @getCard().getOwnerId()) or (@activeOnEnemyTurn && @getGameSession().getCurrentPlayer().getPlayerId() != @getCard().getOwnerId())
      @onTurnWatch(@getGameSession().getExecutingAction())

  onTurnWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = PlayerModifierEmblemEndTurnWatch