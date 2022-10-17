Modifier =           require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierMyGeneralDamagedWatch extends Modifier

  type:"ModifierMyGeneralDamagedWatch"
  @type:"ModifierMyGeneralDamagedWatch"

  @modifierName:"My General Damaged Watch"
  @description:"My General Damaged Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyGeneralDamagedWatch"]

  onAfterCleanupAction: (actionEvent) ->
    super(actionEvent)

    action = actionEvent.action
    # check if action is a damage action targeting my General
    if action instanceof DamageAction
      target = action.getTarget()
      if target? and target.getIsSameTeamAs(@getCard()) and target.getWasGeneral() and @willDealDamage(action)
        @onDamageDealtToGeneral(action)

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    return action.getTotalDamageAmount() > 0

  onDamageDealtToGeneral: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyGeneralDamagedWatch
