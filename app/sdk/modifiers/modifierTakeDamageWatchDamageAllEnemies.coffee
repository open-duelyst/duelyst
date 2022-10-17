ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CONFIG = require 'app/common/config'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDamageAllEnemies extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDamageAllEnemies"
  @type:"ModifierTakeDamageWatchDamageAllEnemies"

  @modifierName:"Take Damage Watch"
  @description:"Whenever this minion takes damage, deal %X damage to all enemies"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onDamageTaken: (action) ->
    for enemyMinion in @getGameSession().getBoard().getEnemyEntitiesForEntity(@getCard(), CardType.Unit)
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(enemyMinion)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierTakeDamageWatchDamageAllEnemies
