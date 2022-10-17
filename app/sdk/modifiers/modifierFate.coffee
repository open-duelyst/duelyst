Modifier = require './modifier'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
Action = require 'app/sdk/actions/action'

i18next = require 'i18next'

class ModifierFate extends Modifier

  type:"ModifierFate"
  @type:"ModifierFate"

  @isKeyworded: true
  @modifierName: "Trial"
  @description: null
  @keywordDefinition: "Starts locked in your action bar. Complete the Trial to unlock the ability to play this card."

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: false

  isRemovable: false

  fxResource: ["FX.Modifiers.ModifierFate"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.fateFulfilled = false

    return p

  onValidateAction:(actionEvent) ->
    a = actionEvent.action

    if !@fateConditionFulfilled()
      if a instanceof PlayCardFromHandAction and a.getIsValid() and @getCard().getIsLocatedInHand() and a.getOwner() is @getCard().getOwner()
        if @getCard().getOwner().getDeck().getCardInHandAtIndex(a.indexOfCardInHand)?.getIndex() is @getCard().getIndex()
          @invalidateAction(a, @getCard().getPosition(), "Cannot be played until the Fate condition is met.")

  onActivate: () ->
    # when initially activated, check fate condition across game session
    # this is done in case the fate card is added mid-game
    @checkFate(@getGameSession().filterActions(@getIsActionRelevant.bind(@)))

  onAction: (e) ->
    action = e.action
    @checkFate([action])

  checkFate: (actions) ->
    if !@_private.fateFulfilled and actions?
      for action in actions
        if action? and action instanceof Action
          @updateFateCondition(action)

  fateConditionFulfilled: () ->
    return @_private.fateFulfilled

  unlockFateCard: () ->
    # override if something needs to happen when fate card is unlocked

  getIsActionRelevant: (action) ->
    # override in sub class to filter only actions to check for fate condition
    return true

  updateFateCondition: (action) ->
    # override in sub class to check if fate condition has been fulfilled
    if @fateConditionFulfilled()
      @unlockFateCard()

module.exports = ModifierFate
