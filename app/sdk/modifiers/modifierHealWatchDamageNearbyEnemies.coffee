Modifier = require './modifier'
ModifierHealWatch = require './modifierHealWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierHealWatchDamageNearbyEnemies extends ModifierHealWatch

  type:"ModifierHealWatchDamageNearbyEnemies"
  @type:"ModifierHealWatchDamageNearbyEnemies"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierHealWatch", "FX.Modifiers.ModifierGenericDamageNearby"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  onHealWatch: (action) ->
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierHealWatchDamageNearbyEnemies
