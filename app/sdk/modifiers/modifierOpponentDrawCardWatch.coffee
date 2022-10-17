Modifier = require './modifier'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
BurnCardAction = require 'app/sdk/actions/burnCardAction'

class ModifierOpponentDrawCardWatch extends Modifier

  type:"ModifierOpponentDrawCardWatch"
  @type:"ModifierOpponentDrawCardWatch"

  @modifierName:"ModifierOpponentDrawCardWatch"
  @description: "Whenever your opponent draws a card ..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierOpponentDrawCardWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for opponent player drawing a card
    if @getGameSession().getIsRunningAsAuthoritative()
      if action instanceof DrawCardAction and !(action instanceof BurnCardAction) and action.getOwnerId() isnt @getCard().getOwnerId()
        @onDrawCardWatch(action)

  onDrawCardWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierOpponentDrawCardWatch
