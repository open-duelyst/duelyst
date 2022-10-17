Modifier = require './modifier'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'

class ModifierReplaceWatch extends Modifier

  type:"ModifierReplaceWatch"
  @type:"ModifierReplaceWatch"

  @modifierName:"Replace Watch"
  @description: "Replace Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierReplaceWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for my player replacing a card
    if action instanceof ReplaceCardFromHandAction and action.getOwnerId() is @getCard().getOwnerId()
      @onReplaceWatch(action)

  onReplaceWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierReplaceWatch
