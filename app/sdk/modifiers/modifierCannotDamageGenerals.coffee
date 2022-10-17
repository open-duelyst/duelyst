EVENTS = require 'app/common/event_types'
ModifierCannot = require './modifierCannot'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierCannotDamageGenerals extends ModifierCannot

  type:"ModifierCannotDamageGenerals"
  @type:"ModifierCannotDamageGenerals"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof DamageAction and a.getTarget().getIsGeneral() and a.getSource() is @getCard()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.setDamageMultiplier(0)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierCannotDamageGenerals
