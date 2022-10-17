EVENTS = require 'app/common/event_types'
CONFIG = require 'app/common/config'
Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'
i18next = require 'i18next'

class ModifierBlastAttack extends Modifier

  type:"ModifierBlastAttack"
  @type:"ModifierBlastAttack"

  @isKeyworded: true
  @keywordDefinition:i18next.t("modifiers.blast_def")

  @modifierName:i18next.t("modifiers.blast_name")
  @description:null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierBlast"]
  cardFXResource: ["FX.Cards.Faction3.Blast"]

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if event.type == EVENTS.entities_involved_in_attack
        @onEntitiesInvolvedInAttack(event)

  onActivate: () ->
    super()

    # override the attack pattern with blast
    @getCard().setCustomAttackPattern(CONFIG.PATTERN_BLAST)

  onDeactivate: () ->
    super()

    @getCard().setCustomAttackPattern(null) #entity can no longer attack whole row if blast is dispelled
    @getCard().setReach(CONFIG.REACH_MELEE) #turn it into a plain melee unit

  getIsActionRelevant: (a) ->
    # when this unit initially attacks (only blast on explicit initial attacks, not on strike backs or other implicit attacks)
    return a instanceof AttackAction and a.getSource() == @getCard() and !a.getIsImplicit()

  getAttackableEntities: (a) ->
    entities = []
    target = a.getTarget()

    if target?
      # find all other attackable enemy entities
      for entity in @getGameSession().getBoard().getEnemyEntitiesOnCardinalAxisFromEntityToPosition(@getCard(), target.getPosition(), CardType.Unit, false)
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

  postDeserialize: () ->
    super()
    if @getCard()? and @_private.cachedIsActive
      # override the attack pattern with blast
      @getCard().setCustomAttackPattern(CONFIG.PATTERN_BLAST)

module.exports = ModifierBlastAttack
