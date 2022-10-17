ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierTakeDamageWatchDamageNearbyEnemiesForSame extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchDamageNearbyEnemiesForSame"
  @type:"ModifierTakeDamageWatchDamageNearbyEnemiesForSame"

  @modifierName:"Take Damage Watch Damage Enemy For Same"
  @description:"Whenever this minion takes damage, deal that much damage to all nearby enemies"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericDamage"]

  onDamageTaken: (action) ->
    damageAmount = action.getTotalDamageAmount()
    # deal same damage taken to all enemies
    for unit in @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(unit)
      damageAction.setDamageAmount(damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierTakeDamageWatchDamageNearbyEnemiesForSame
