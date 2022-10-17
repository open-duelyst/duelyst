Modifier = require './modifier'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
BurnCardAction = require 'app/sdk/actions/burnCardAction'

class ModifierDrawCardWatch extends Modifier

  type:"ModifierDrawCardWatch"
  @type:"ModifierDrawCardWatch"

  @modifierName:"DrawCardWatch"
  @description: "Whenever you draw a card ..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierDrawCardWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for my player drawing a card
    if action instanceof DrawCardAction and !(action instanceof BurnCardAction) and action.getOwnerId() is @getCard().getOwnerId()
      @onDrawCardWatch(action)

  onDrawCardWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierDrawCardWatch
