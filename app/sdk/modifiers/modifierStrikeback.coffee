EVENTS = require 'app/common/event_types'
CONFIG =     require 'app/common/config'
Modifier =   require './modifier'
ModifierBlastAttack = require './modifierBlastAttack'
AttackAction =   require 'app/sdk/actions/attackAction'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'

class ModifierStrikeback extends Modifier

  type:"ModifierStrikeback"
  @type:"ModifierStrikeback"

  #@isKeyworded: true
  #@keywordDefinition: "Whenever this minion is attacked, it simultaneously counterattacks."

  @modifierName:"Strikeback"
  @description:null
  @isHiddenToUI: true
  isRemovable: false
  isCloneable: false

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1
  fxResource: ["FX.Modifiers.ModifierStrikeback"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.entities_involved_in_attack
        @onEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    # attack against this entity must be explicit or caused by a specific modifier that entities are allowed to strikeback against
    return ((a instanceof AttackAction and (!a.getIsImplicit() || a.getTriggeringModifier() instanceof ModifierBlastAttack)) or a instanceof ForcedAttackAction) and a.getTarget() == @getCard() and a.getSource() isnt @getCard() and a.getIsStrikebackAllowed() and @getCard().getATK() > 0 and @getCanReachEntity(a.getSource())

  onBeforeAction: (actionEvent) ->
    a = actionEvent.action
    if @getIsActionRelevant(a)
      attackAction = @getCard().actionAttack(a.getSource())
      @getCard().getGameSession().executeAction(attackAction)

  onEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      attackAction = @getCard().actionAttack(a.getSource())
      attackAction.setTriggeringModifier(@)
      actionEvent.actions.push(attackAction)

  getCanReachEntity: (entity) ->
    # check that entity is within my range
    reach = @getCard().getReach()
    if reach == 1
      for nearbyEntity in @getCard().getGameSession().getBoard().getEntitiesAroundEntity(@getCard())
        if nearbyEntity == entity
          return true
    else if reach > 1
      return true

    return false

module.exports = ModifierStrikeback
