Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatch extends Modifier

  type:"ModifierTakeDamageWatch"
  @type:"ModifierTakeDamageWatch"

  @modifierName:"Take Damage Watch"
  @description:"Whenever this minion takes damage..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch"]

  onAction: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if a instanceof DamageAction and a.getTarget() == @getCard()
      if @willDealDamage(a) # check if anything is preventing this action from dealing its damage
        @onDamageTaken(a)

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    if action.getTotalDamageAmount() > 0
      return true

    return false

  onDamageTaken: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierTakeDamageWatch
