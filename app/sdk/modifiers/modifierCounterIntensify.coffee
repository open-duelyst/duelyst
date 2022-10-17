ModifierCounter = require './modifierCounter'
ModifierCounterIntensifyDescription = require './modifierCounterIntensifyDescription'
Modifier = require './modifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'

i18next = require('i18next')

###
  Counts intensify count on this card
  NOTE: this counter updateCountIfNeeded since Intensify ONLY needs to check for count changes
  after cards are played to board, rather than on any arbitrary action
###
class ModifierCounterIntensify extends ModifierCounter

  type:"ModifierCounterIntensify"
  @type:"ModifierCounterIntensify"

  activeInDeck: false
  activeOnBoard: false

  maxStacks: 1

  onActivate: () ->
    intensifyCount = 1
    relevantActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    if relevantActions?
      intensifyCount += relevantActions.length
    @_private.currentCount = intensifyCount
    @updateCountIfNeeded()

  updateCountIfNeeded: () ->
    if @_private.currentCount != @_private.previousCount
      @removeSubModifiers()
      @getGameSession().applyModifierContextObject(@getModifierContextObjectToApply(), @getCard(), @)
      @_private.previousCount = @_private.currentCount

  getModifierContextObjectToApply: () ->
    modContextObject = ModifierCounterIntensifyDescription.createContextObject(@_private.currentCount)
    modContextObject.appliedName = i18next.t("modifiers.intensify_counter_applied_name")
    return modContextObject

  onAfterAction: (event) ->
    super(event)
    action = event.action
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getOwnerId() and action.getCard().getBaseCardId() is @getCard().getBaseCardId()
      @_private.currentCount++
      @updateCountIfNeeded()

  getIsActionRelevant: (action) ->
    # instances playing card this is attached to
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getOwnerId() and action.getCard().getBaseCardId() is @getCard().getBaseCardId()
      return true
    else
      return false

module.exports = ModifierCounterIntensify
