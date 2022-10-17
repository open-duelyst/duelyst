EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierAttacksDealNoDamage extends Modifier

  type:"ModifierAttacksDealNoDamage"
  @type:"ModifierAttacksDealNoDamage"

  maxStacks: 1

  @modifierName:i18next.t("modifiers.attacks_deal_no_damage_name")
  @description:i18next.t("modifiers.attack_equals_health_def")

  activeInHand: false
  activeInDeck: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierAttacksDealNoDamage"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof AttackAction and a.getSource() == @getCard()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.changeDamageMultiplierBy(0)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierAttacksDealNoDamage
