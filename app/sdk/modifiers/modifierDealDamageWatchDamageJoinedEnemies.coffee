ModifierDealDamageWatch = require './modifierDealDamageWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierDealDamageWatchDamageJoinedEnemies extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchDamageJoinedEnemies"
  @type:"ModifierDealDamageWatchDamageJoinedEnemies"

  @modifierName:"Deal Damage to an enemy and all joined enemies"
  @description:"Whenever this minion deals damage to an enemy, damage all joined enemies"

  fxResource: ["FX.Modifiers.ModifierGenericChainLightning"]

  onDealDamage: (action) ->

    unit = action.getTarget()
    if unit? and unit.getOwnerId() != @getCard().getOwnerId()

      damagedPositions = []
      damageAmount = action.getDamageAmount()
      position = unit.getPosition()
      damagedPositions.push(position)
      
      @damageEnemiesNearby(damageAmount, unit, damagedPositions)

  damageEnemiesNearby: (damageAmount, unit, damagedPositions) ->

    enemiesNearby = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(unit, CardType.Unit, 1)
    for enemy in enemiesNearby
      if enemy?
        enemyPosition = enemy.getPosition()
        alreadyDamaged = false
        for position in damagedPositions
          if enemyPosition.x == position.x and enemyPosition.y == position.y
            alreadyDamaged = true
            break
        if !alreadyDamaged
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(enemy)
          damageAction.setDamageAmount(damageAmount)
          @getGameSession().executeAction(damageAction)

          damagedPositions.push(enemyPosition)
          @damageEnemiesNearby(damageAmount, enemy, damagedPositions)

module.exports = ModifierDealDamageWatchDamageJoinedEnemies
