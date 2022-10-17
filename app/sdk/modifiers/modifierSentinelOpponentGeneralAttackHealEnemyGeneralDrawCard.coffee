ModifierSentinel = require './modifierSentinel'
CardType = require 'app/sdk/cards/cardType'
AttackAction = require 'app/sdk/actions/attackAction'
HealAction = require 'app/sdk/actions/healAction'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
i18next = require('i18next')

class ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard extends ModifierSentinel

  type:"ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard"
  @type:"ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard"

  @description: i18next.t("modifiers.sentinel_general_attack")

  @createContextObject: (description, transformCardId, healAmount=5, options) ->
    contextObject = super(description, transformCardId, options)
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description
    else
      return super()

  getIsActionRelevant: (action) ->
    # watch for opponent General attacking
    if action instanceof AttackAction and action.getSource() is @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      return true
    else
      return false

  onOverwatch: (action) ->
    newUnit = super(action)
    if @getIsActionRelevant(action)
      if action.getTarget() is @getCard()
        action.setTarget(newUnit)

      enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))

      healAction2 = new HealAction(this.getGameSession())
      healAction2.setOwnerId(@getCard().getOwnerId())
      healAction2.setTarget(enemyGeneral)
      healAction2.setHealAmount(@healAmount)
      @getGameSession().executeAction(healAction2)

      @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))

module.exports = ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard
