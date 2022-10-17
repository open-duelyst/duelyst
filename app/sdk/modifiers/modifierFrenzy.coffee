EVENTS = require 'app/common/event_types'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'
CardType = require 'app/sdk/cards/cardType'

i18next = require('i18next')

class ModifierFrenzy extends Modifier

  type: "ModifierFrenzy"
  @type: "ModifierFrenzy"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.frenzy_def")
  maxStacks: 1

  @modifierName: i18next.t("modifiers.frenzy_name")
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierFrenzy"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.entities_involved_in_attack
        @onEntitiesInvolvedInAttack(event)

  getIsActionRelevant: (a) ->
    # frenzy when we notice our entity is attacking, but only on an explict attack (i.e. not on a strikeback)
    if a.getSource() == @getCard() and ((a instanceof AttackAction and !a.getIsImplicit()) or a instanceof ForcedAttackAction)
      # check if attack is in melee range
      target = a.getTarget()
      targetPosition = target.getPosition()
      entityPosition = @getCard().getPosition()
      return Math.abs(targetPosition.x - entityPosition.x) <= 1 and Math.abs(targetPosition.y - entityPosition.y) <= 1
    return false

  getAttackableEntities: (a) ->
    entities = []
    target = a.getTarget()

    # find all other attackable enemy entities
    for entity in @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      if entity != target
        entities.push(entity)

    return entities

  onBeforeAction: (event) ->
    super(event)

    a = event.action
    if @getIsActionRelevant(a)
      for entity in @getAttackableEntities(a)
        attackAction = @getCard().actionAttack(entity)
        @getGameSession().executeAction(attackAction)

  onEntitiesInvolvedInAttack: (actionEvent) ->
    a = actionEvent.action
    if @getIsActive() and @getIsActionRelevant(a)
      for entity in @getAttackableEntities(a)
        attackAction = @getCard().actionAttack(entity)
        attackAction.setTriggeringModifier(@)
        actionEvent.actions.push(attackAction)

module.exports = ModifierFrenzy
