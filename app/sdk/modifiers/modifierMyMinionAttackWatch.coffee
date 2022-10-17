Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierMyMinionAttackWatch extends Modifier

  type:"ModifierMyMinionAttackWatch"
  @type:"ModifierMyMinionAttackWatch"

  @modifierName:"MyMinionAttackWatch"
  @description:"Whenever you attack with a minion..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMinionAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()
    if action instanceof AttackAction and source.getOwner() is @getCard().getOwner() and !source.getIsGeneral() and !action.getIsImplicit()
      @onMyMinionAttackWatch(action)

  onMyMinionAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyMinionAttackWatch
