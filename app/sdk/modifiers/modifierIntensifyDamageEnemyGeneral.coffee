ModifierIntensify = require './modifierIntensify'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierIntensifyDamageEnemyGeneral extends ModifierIntensify

  type:"ModifierIntensifyDamageEnemyGeneral"
  @type:"ModifierIntensifyDamageEnemyGeneral"

  damageAmount: 0

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onIntensify: () ->

    totalDamageAmount = @getIntensifyAmount() * @damageAmount

    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    enemyDamageAction = new DamageAction(@getGameSession())
    enemyDamageAction.setOwnerId(@getCard().getOwnerId())
    enemyDamageAction.setSource(@getCard())
    enemyDamageAction.setTarget(enemyGeneral)
    enemyDamageAction.setDamageAmount(totalDamageAmount)
    @getGameSession().executeAction(enemyDamageAction)

module.exports = ModifierIntensifyDamageEnemyGeneral