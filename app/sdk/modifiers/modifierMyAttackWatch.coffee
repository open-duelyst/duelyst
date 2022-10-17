Logger = require 'app/common/logger'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierMyAttackWatch extends Modifier

  type:"ModifierMyAttackWatch"
  @type:"ModifierMyAttackWatch"

  @modifierName:"Attack Watch: Self"
  @description:"Attack Watch: Self"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if action.getSource() == @getCard() and ((action instanceof AttackAction and (!action.getIsImplicit() or action.getIsAutomatic())) or action instanceof ForcedAttackAction)
      @onMyAttackWatch(action)

  onMyAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyAttackWatch
