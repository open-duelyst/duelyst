EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
KillAction = require 'app/sdk/actions/killAction'
i18next = require 'i18next'

class ModifierShatteringHeart extends Modifier

  type:"ModifierShatteringHeart"
  @type:"ModifierShatteringHeart"

  @modifierName:i18next.t("modifiers.shattering_heart_name")
  @description:i18next.t("modifiers.shattering_heart_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

      if event.type == EVENTS.entities_involved_in_attack
        @onEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof AttackAction and !(a.getTarget()?.getIsGeneral()) and a.getSource() is @getCard() and a.getTarget()?.hasModifierClass(ModifierStunned)

  _modifyAction: (a) ->
    a.setIsStrikebackAllowed(false)

  onAction: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      target = a.getTarget()
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getCard())
      killAction.setTarget(target)
      @getGameSession().executeAction(killAction)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

  onEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      target = a.getTarget()
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getCard())
      killAction.setTarget(target)
      actionEvent.actions.push(killAction)

module.exports = ModifierShatteringHeart
