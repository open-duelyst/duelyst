EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDoubleDamageToGenerals extends Modifier

  type:"ModifierDoubleDamageToGenerals"
  @type:"ModifierDoubleDamageToGenerals"

  @modifierName:"Double Damage To Generals"
  @description:"Deals double damage to Generals"

  activeInHand: false
  activeInDeck: false
  activeOnBoard: true

  damageBonus: 2

  fxResource: ["FX.Modifiers.ModifierDoubleDamageToGenerals"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof DamageAction and a.getSource() == @getCard() and a.getTarget()?.getIsGeneral()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.changeDamageMultiplierBy(@damageBonus)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierDoubleDamageToGenerals
