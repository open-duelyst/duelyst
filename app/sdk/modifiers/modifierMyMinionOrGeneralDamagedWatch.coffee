Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierMyMinionOrGeneralDamagedWatch extends Modifier

  type:"ModifierMyMinionOrGeneralDamagedWatch"
  @type:"ModifierMyMinionOrGeneralDamagedWatch"

  @modifierName:"My General Damaged Watch"
  @description:"My General Damaged Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyMinionOrGeneralDamagedWatch"]

  onAfterCleanupAction: (actionEvent) ->
    super(actionEvent)

    action = actionEvent.action
    # check if action is a damage action targeting my General
    if action instanceof DamageAction and action.getTarget()?.getOwnerId() is @getCard().getOwnerId()
      if @willDealDamage(action) # check if anything is preventing this action from dealing its damage
        @onDamageDealtToMinionOrGeneral(action)

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    return action.getTotalDamageAmount() > 0

  onDamageDealtToMinionOrGeneral: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyMinionOrGeneralDamagedWatch
