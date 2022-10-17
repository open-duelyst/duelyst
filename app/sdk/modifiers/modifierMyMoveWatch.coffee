Modifier = require './modifier'
MoveAction = require 'app/sdk/actions/moveAction'

class ModifierMyMoveWatch extends Modifier

  type:"ModifierMyMoveWatch"
  @type:"ModifierMyMoveWatch"

  @modifierName:"Move Watch: Self"
  @description:"Move Watch: Self"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if action instanceof MoveAction and action.getSource() == @getCard()
      @onMyMoveWatch(action)

  onMyMoveWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyMoveWatch
