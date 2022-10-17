Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEnemyDealDamageWatch extends Modifier

  type:"ModifierEnemyDealDamageWatch"
  @type:"ModifierEnemyDealDamageWatch"

  @modifierName:"Enemy Deal Damage Watch"
  @description:"Whenever an enemy deals damage..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onAction: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if a instanceof DamageAction and a.getTarget()?.getOwnerId() is @getCard().getOwnerId()
      if @willDealDamage(a) # check if anything is preventing this action from dealing its damage
        @onEnemyDamageDealt(a)

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    if action.getTotalDamageAmount() > 0
      return true
    return false

  onEnemyDamageDealt: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyDealDamageWatch
