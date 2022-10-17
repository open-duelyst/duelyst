ModifierEnemyStunWatch = require './modifierEnemyStunWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierEnemyStunWatchDamageNearbyEnemies extends ModifierEnemyStunWatch

  type:"ModifierEnemyStunWatchDamageNearbyEnemies"
  @type:"ModifierEnemyStunWatchDamageNearbyEnemies"

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  damageAmount: 0

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  onEnemyStunWatch: (action) ->
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      if entity?
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierEnemyStunWatchDamageNearbyEnemies
