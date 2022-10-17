EVENTS = require 'app/common/event_types'
Logger = require 'app/common/logger'
ModifierImmune = require './modifierImmune'
DamageAction = require 'app/sdk/actions/damageAction'

###
  Modifier that reduces all damage dealt to this unit to 0.
###

class ModifierImmuneToDamage extends ModifierImmune

  type: "ModifierImmuneToDamage"
  @type: "ModifierImmuneToDamage"

  @modifierName: "Damage Immunity"
  @description: "Takes no damage"

  fxResource: ["FX.Modifiers.ModifierAntiMagicField"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return @getCard()? and a instanceof DamageAction and @getCard() is a.getTarget()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.setDamageMultiplier(0)

  onModifyActionForExecution: (event) ->
    a = event.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierImmuneToDamage
