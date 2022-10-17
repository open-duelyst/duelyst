EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'
i18next = require 'i18next'


class ModifierAbsorbDamage extends Modifier

  type:"ModifierAbsorbDamage"
  @type:"ModifierAbsorbDamage"

  @modifierName:i18next.t("modifiers.absorb_damage_name")
  @description:i18next.t("modifiers.absorb_damage_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  canAbsorb: true # can absorb damage from 1 damage action per turn

  fxResource: ["FX.Modifiers.ModifierAbsorbDamage"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  @createContextObject: (absorbAmount, options) ->
    contextObject = super(options)
    contextObject.damageAbsorbAmount = absorbAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.absorb_damage_def",{amount:@damageAbsorbAmount})
    else
      return @description

  onStartTurn: (actionEvent) ->
    super(actionEvent)
    @canAbsorb = true

  getIsActionRelevant: (a) ->
    return @canAbsorb and a instanceof DamageAction and a.getTarget() is @getCard()

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.changeFinalDamageBy(-@damageAbsorbAmount)

  onModifyActionForExecution: (actionEvent) ->
    super(actionEvent)

    a = actionEvent.action
    if @getIsActionRelevant(a)
      @_modifyAction(a)
      @canAbsorb = false

  onModifyActionForEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      @_modifyAction(a)

module.exports = ModifierAbsorbDamage
