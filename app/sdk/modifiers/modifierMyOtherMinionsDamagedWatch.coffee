Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierMyOtherMinionsDamagedWatch extends Modifier

  type:"ModifierMyOtherMinionsDamagedWatch"
  @type:"ModifierMyOtherMinionsDamagedWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyOtherMinionsDamagedWatch"]

  onAfterCleanupAction: (actionEvent) ->
    super(actionEvent)

    action = actionEvent.action
    # check if action is a damage action targeting a friendly minion
    if action instanceof DamageAction and action.getTarget()?.getOwnerId() is @getCard().getOwnerId() and action.getTarget() isnt @getCard() and !action.getTarget().getIsGeneral()
      if @willDealDamage(action) # check if anything is preventing this action from dealing its damage
        @onDamageDealtToMinion(action)

  willDealDamage: (action) ->
    # total damage should be calculated during modify_action_for_execution phase
    return action.getTotalDamageAmount() > 0

  onDamageDealtToMinion: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyOtherMinionsDamagedWatch
