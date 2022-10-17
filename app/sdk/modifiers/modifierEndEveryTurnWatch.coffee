Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
EndTurnAction = require 'app/sdk/actions/endTurnAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierEndEveryTurnWatch extends Modifier

  type:"ModifierEndEveryTurnWatch"
  @type:"ModifierEndEveryTurnWatch"

  @modifierName:"End Every Turn Watch"
  @description: "End Every Turn Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierEndEveryTurnWatch"]

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

    @onTurnWatch(@getGameSession().getExecutingAction())

  onTurnWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEndEveryTurnWatch
