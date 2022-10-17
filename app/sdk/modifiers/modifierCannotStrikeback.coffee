EVENTS = require 'app/common/event_types'
ModifierCannot = require './modifierCannot'
AttackAction = require 'app/sdk/actions/attackAction'
i18next = require 'i18next'

class ModifierCannotStrikeback extends ModifierCannot

  type:"ModifierCannotStrikeback"
  @type:"ModifierCannotStrikeback"

  @modifierName:i18next.t("modifiers.cannot_strikeback_name")
  @description:i18next.t("modifiers.cannot_strikeback_def")

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof AttackAction and a.getTarget() == @getCard()

  _modifyAction: (a) ->
    a.setIsStrikebackAllowed(false)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierCannotStrikeback
