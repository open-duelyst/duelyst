EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
ModifierOverwatchHidden = require './modifierOverwatchHidden'
RevealHiddenCardAction = require 'app/sdk/actions/revealHiddenCardAction'
DieAction = require 'app/sdk/actions/dieAction'

class ModifierOverwatch extends Modifier

  type:"ModifierOverwatch"
  @type:"ModifierOverwatch"

  @isKeyworded: true
  @keywordDefinition:"A hidden effect which only takes place when a specific event occurs."

  @modifierName:"Guardian"
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true
  isRemovable: false

  maxStacks: 1

  hideAsModifierType: ModifierOverwatchHidden.type

  fxResource: ["FX.Modifiers.ModifierOverwatch"]

  @createContextObject: (description,options) ->
    contextObject = super(options)
    contextObject.description = description
    return contextObject

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents and @_private.cachedIsActive
      eventType = event.type
      if eventType == EVENTS.overwatch
        @onCheckForOverwatch(event)

  onCheckForOverwatch: (e) ->
    action = e.action
    if @getCanReactToAction(action) and @getIsActionRelevant(action)
      # setup for triggering
      @getGameSession().pushTriggeringModifierOntoStack(@)

      # reveal the overwatch card
      revealAction = new RevealHiddenCardAction(@getGameSession(), @getOwnerId(), @getRevealedCardData())
      revealAction.setTarget(@getSourceCard())
      @getGameSession().executeAction(revealAction)

      # trigger overwatch
      @onOverwatch(action)

      # remove self
      @getGameSession().removeModifier(@)

      # force stop buffering of events
      # the game session does this automatically
      # but we need it to happen directly following all the overwatch actions
      @getGameSession().executeAction(@getGameSession().actionStopBufferingEvents())

      # stop triggering
      @getGameSession().popTriggeringModifierFromStack()

  getCanReactToAction: (action) ->
    # overwatch can only react on authoritative source on opponent's turn
    return @getGameSession().getIsRunningAsAuthoritative() and @getGameSession().getCurrentPlayerId() != @getOwnerId() and super(action)

  getIsActionRelevant: (action) ->
    # override me in sub classes to determine whether overwatch is triggered
    return false

  getRevealedCardData: ()->
    sourceCard = @getSourceCard()
    return sourceCard && sourceCard.createCardData()

  onOverwatch: (action) ->
    # override me in sub classes to implement special behavior for when overwatch is triggered

  # if a minion has an overwatch buff and dies without triggering overwatch, then draw a card
  # onAction: (e) ->
  #   super(e)

  #   action = e.action

  #   if action instanceof DieAction and action.getTarget() is @getCard() and @getCard().getIsRemoved()
  #     deck = @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck()
  #     if deck?
  #       @getCard().getGameSession().executeAction(deck.actionDrawCard())

module.exports = ModifierOverwatch
