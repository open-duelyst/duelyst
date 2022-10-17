EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDoubleDamageToMinions extends Modifier

  type:"ModifierDoubleDamageToMinions"
  @type:"ModifierDoubleDamageToMinions"

  @modifierName:"Double Damage To Minions"
  @description:"Deals double damage to minions"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  damageBonus: 2

  fxResource: ["FX.Modifiers.ModifierDoubleDamageToMinions"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.modify_action_for_entities_involved_in_attack
        @onModifyActionForEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    return a instanceof AttackAction and a.getSource() == @getCard() and !a.getTarget()?.getIsGeneral()

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

module.exports = ModifierDoubleDamageToMinions
