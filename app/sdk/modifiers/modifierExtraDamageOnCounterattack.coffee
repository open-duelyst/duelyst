Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
ModifierStrikeback = require './modifierStrikeback'
EVENTS = require 'app/common/event_types'

class ModifierExtraDamageOnCounterattack extends Modifier

  type:"ModifierExtraDamageOnCounterattack"
  @type:"ModifierExtraDamageOnCounterattack"

  @modifierName:"Extra Damage on Counterattack"
  @description:"Deals double damage on counter attacks"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch"]

  @createContextObject: (extraDamage=2,options) ->
    contextObject = super(options)
    contextObject.extraDamage = extraDamage
    return contextObject

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  getIsActionRelevant: (a) ->
    # check if this action will deal damage or take damage
    return a.getTriggeringModifier() instanceof ModifierStrikeback and a.getSource() == @getCard()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.changeDamageMultiplierBy(@extraDamage)

module.exports = ModifierExtraDamageOnCounterattack
