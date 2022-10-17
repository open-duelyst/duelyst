Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
EndTurnAction = require 'app/sdk/actions/endTurnAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierEndTurnWatch extends Modifier

  type:"ModifierEndTurnWatch"
  @type:"ModifierEndTurnWatch"

  @modifierName:"End Turn Watch"
  @description: "End Turn Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

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

    if @getGameSession().getCurrentPlayer().getPlayerId() is @getCard().getOwnerId()
      @onTurnWatch(@getGameSession().getExecutingAction())

  onTurnWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEndTurnWatch
