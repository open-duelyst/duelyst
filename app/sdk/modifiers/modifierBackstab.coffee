EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
ModifierAlwaysBackstabbed = require './modifierAlwaysBackstabbed'

i18next = require('i18next')

class ModifierBackstab extends Modifier

  type:"ModifierBackstab"
  @type:"ModifierBackstab"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.backstab_def")

  @modifierName:i18next.t("modifiers.backstab_name")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierBackstab"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  @createContextObject: (backstabBonus=0,options) ->
    contextObject = super(options)
    contextObject.backstabBonus = backstabBonus
    return contextObject
    
  getIsActionRelevant: (a) ->
    return a instanceof AttackAction and a.getSource() == @getCard() and (@getGameSession().getBoard().getIsPositionBehindEntity(a.getTarget(), @getCard().getPosition(), 1, 0) or a.getTarget()?.hasActiveModifierClass(ModifierAlwaysBackstabbed))

  _modifyAction: (a) ->
    a.setChangedByModifier(@)
    a.changeDamageBy(@backstabBonus)
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

  getBackstabBonus: () ->
    return @backstabBonus

module.exports = ModifierBackstab
