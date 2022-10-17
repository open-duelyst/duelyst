ModifierStartTurnWatch = require './modifierStartTurnWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'
CONFIG = require 'app/common/config'

class ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned"
  @type:"ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned"

  @modifierName:"Turn Watch"
  @description:i18next.t("modifiers.start_turn_watch_damage_general_equal_to_minions_owned_def")

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericChainLightningRed"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

  onTurnWatch: (action) ->
    super(action)

    enemyMinions = @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
    damageAmount = enemyMinions.length - 1 #removing 1 point of damage since the enemy general is included
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    if general?
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(general)
      damageAction.setDamageAmount(damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned
