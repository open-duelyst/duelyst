Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierMyGeneralAttackWatch extends Modifier

  type:"ModifierMyGeneralAttackWatch"
  @type:"ModifierMyGeneralAttackWatch"

  @modifierName:"Attack Watch: My General"
  @description:"Attack Watch: My General"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()
    if action instanceof AttackAction and source.getOwner() is @getCard().getOwner() and source.getIsGeneral() and !action.getIsImplicit()
      @onMyGeneralAttackWatch(action)

  onMyGeneralAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyGeneralAttackWatch
