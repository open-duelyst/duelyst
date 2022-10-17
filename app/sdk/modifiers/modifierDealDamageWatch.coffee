Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDealDamageWatch extends Modifier

  type:"ModifierDealDamageWatch"
  @type:"ModifierDealDamageWatch"

  @modifierName:"Deal Damage Watch"
  @description:"Each time this unit damages an enemy unit..."

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
      @onDealDamage(a)

  onAfterCleanupAction: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @onAfterDealDamage(a)

  getIsActionRelevant: (a) ->
    # check if this action will deal damage
    isRelevant = a instanceof DamageAction and a.getSource() == @getCard() and @willDealDamage(a)
    if @enemyOnly # check that target of damage action is an enemy
      isRelevant = isRelevant and a.getTarget().getOwnerId() isnt @getCard().getOwnerId()
    return isRelevant

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    return action.getTotalDamageAmount() > 0

  onDealDamage: (action) ->
    # override me in sub classes to implement special behavior
    # use this for most on damage triggers

  onAfterDealDamage: (action) ->
    # override me in sub classes to implement special behavior
    # use this for on deal damage triggers that MUST happen last
    # - careful! if the unit dies during this step, this method will not be called!

module.exports = ModifierDealDamageWatch
