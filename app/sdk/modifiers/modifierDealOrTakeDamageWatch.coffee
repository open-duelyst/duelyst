Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDealOrTakeDamageWatch extends Modifier

  type:"ModifierDealOrTakeDamageWatch"
  @type:"ModifierDealOrTakeDamageWatch"

  @modifierName:"Deal Or Take Damage Watch"
  @description:"Each time this unit takes damage or damages an enemy unit..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  enemyOnly: false # whether this should trigger ONLY on damage dealt to enemies, or on ANY damage dealt

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch"]

  onAction: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @onDealOrTakeDamage(a)

  getIsActionRelevant: (a) ->
    # check if this action will deal damage or take damage
    return a instanceof DamageAction and (a.getSource() == @getCard() or a.getTarget() == @getCard()) and @willDealDamage(a)

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    return action.getTotalDamageAmount() > 0

  onDealOrTakeDamage: (action) ->
    # override me in sub classes to implement special behavior
    # use this for most on damage triggers

module.exports = ModifierDealOrTakeDamageWatch
