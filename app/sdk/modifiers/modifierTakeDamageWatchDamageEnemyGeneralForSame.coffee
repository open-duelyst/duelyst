ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CONFIG = require 'app/common/config'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDamageEnemyGeneralForSame extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDamageEnemyGeneralForSame"
  @type:"ModifierTakeDamageWatchDamageEnemyGeneralForSame"

  @description:"Whenever this minion takes damage, it deals that much damage to the enemy General"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericDamage"]

  onDamageTaken: (action) ->
    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    if enemyGeneral?
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(enemyGeneral)
      damageAction.setDamageAmount(action.getTotalDamageAmount())
      @getGameSession().executeAction(damageAction)

module.exports = ModifierTakeDamageWatchDamageEnemyGeneralForSame
