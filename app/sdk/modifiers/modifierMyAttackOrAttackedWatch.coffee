Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyAttackOrAttackedWatch extends Modifier

  type:"ModifierMyAttackOrAttackedWatch"
  @type:"ModifierMyAttackOrAttackedWatch"

  @modifierName:"Attack or Attacked Watch: Self"
  @description:"Attack or Attacked Watch: Self"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if (action.getSource() == @getCard() or action.getTarget() == @getCard()) and ((action instanceof AttackAction and !action.getIsImplicit()) or action instanceof ForcedAttackAction)
      @onMyAttackOrAttackedWatch(action)

  onMyAttackOrAttackedWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyAttackOrAttackedWatch
