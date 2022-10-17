Modifier = require './modifier'
ModifierOverwatchAttacked = require './modifierOverwatchAttacked'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOverwatchAttackedDamageEnemyGeneralForSame extends ModifierOverwatchAttacked

  type:"ModifierOverwatchAttackedDamageEnemyGeneralForSame"
  @type:"ModifierOverwatchAttackedDamageEnemyGeneralForSame"

  @description: "When this minion is attacked, deal the same damage to enemy general."

  onOverwatch: (action) ->
    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    if enemyGeneral?
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(enemyGeneral)
      damageAction.setDamageAmount(action.getTotalDamageAmount())
      @getGameSession().executeAction(damageAction)

module.exports = ModifierOverwatchAttackedDamageEnemyGeneralForSame
