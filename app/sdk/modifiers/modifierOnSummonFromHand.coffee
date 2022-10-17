Modifier = require './modifier'
PlayCardAction = require 'app/sdk/actions/playCardAction'
ApplyModifierAction = require 'app/sdk/actions/applyModifierAction'


class ModifierOnSummonFromHand extends Modifier

  type:"ModifierOnSummonFromHand"
  @type:"ModifierOnSummonFromHand"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  triggered: false

  onActivate: () ->
    super()

    if !@triggered and @getCard().getIsPlayed()
      # always flag self as triggered when card becomes played
      @triggered = true
      executingAction = @getGameSession().getExecutingAction()

      # account for modifier activated by being applied
      if executingAction? and executingAction instanceof ApplyModifierAction
        parentAction = executingAction.getParentAction()
        if parentAction instanceof PlayCardAction then executingAction = parentAction

      if !executingAction? or (executingAction instanceof PlayCardAction and executingAction.getCard() == @getCard())
        # only trigger when played PlayCardAction or no action (i.e. during game setup)
        @getGameSession().p_startBufferingEvents()
        @onSummonFromHand()

  getIsActiveForCache: () ->
    return !@triggered and super()

  onSummonFromHand: () ->
    # override me in sub classes to implement special behavior

module.exports = ModifierOnSummonFromHand
