Modifier = require './modifier'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
BurnCardAction = require 'app/sdk/actions/burnCardAction'

class ModifierAnyDrawCardWatch extends Modifier

  type:"ModifierAnyDrawCardWatch"
  @type:"ModifierAnyDrawCardWatch"

  @modifierName:"AnyDrawCardWatch"
  @description: "Whenever any player draws a card ..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierAnyDrawCardWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for my player drawing a card
    if action instanceof DrawCardAction and !(action instanceof BurnCardAction)
      @onDrawCardWatch(action)

  onDrawCardWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierAnyDrawCardWatch
