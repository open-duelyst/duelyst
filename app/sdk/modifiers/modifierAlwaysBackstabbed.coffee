Modifier = require './modifier'
ModifierBackstab = require './modifierBackstab'
EVENTS = require 'app/common/event_types'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierAlwaysBackstabbed extends Modifier

  type:"ModifierAlwaysBackstabbed"
  @type:"ModifierAlwaysBackstabbed"

  @isHiddenToUI: false

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierAlwaysBackstabbed"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)
    
  getIsActionRelevant: (a) ->
    return a instanceof AttackAction and a.getTarget() == @getCard()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.setIsStrikebackAllowed(false) # backstab attacker does not suffer strikeback

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierAlwaysBackstabbed