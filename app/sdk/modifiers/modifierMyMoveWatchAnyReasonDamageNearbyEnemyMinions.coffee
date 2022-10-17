ModifierMyMoveWatchAnyReason = require './modifierMyMoveWatchAnyReason'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions extends ModifierMyMoveWatchAnyReason

  type:"ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions"
  @type:"ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions"

  @modifierName:"Move Watch Any Reason Self Damage Nearby Enemy Minions"
  @description:"Move Watch Any Reason Self Damage Nearby Enemy Minions"

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  damageAmount: 0

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  onMyMoveWatchAnyReason: (action) ->
    entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in entities
      if entity?
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions
