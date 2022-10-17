EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'
i18next = require 'i18next'

class ModifierAbsorbDamageGolems extends Modifier

  type:"ModifierAbsorbDamageGolems"
  @type:"ModifierAbsorbDamageGolems"

  @modifierName:i18next.t("modifiers.absorb_damage_golems_name")
  @description:i18next.t("modifiers.absorb_damage_golems_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  canAbsorb: true # can absorb damage from 1 damage action per turn

  fxResource: ["FX.Modifiers.ModifierAbsorbDamageGolems"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof DamageAction and a.getTarget() is @getCard()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.changeFinalDamageBy(-1)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierAbsorbDamageGolems
