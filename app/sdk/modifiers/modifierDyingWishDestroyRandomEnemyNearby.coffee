ModifierDyingWish = require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
KillAction = require 'app/sdk/actions/killAction'

class ModifierDyingWishDestroyRandomEnemyNearby extends ModifierDyingWish

  type:"ModifierDyingWishDestroyRandomEnemyNearby"
  @type:"ModifierDyingWishDestroyRandomEnemyNearby"

  onDyingWish: () ->

    if @getGameSession().getIsRunningAsAuthoritative()

      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      validEntities = []
      for entity in entities
        if !entity.getIsGeneral()
          validEntities.push(entity)

      if validEntities.length > 0
        unitToDestroy = validEntities[@getGameSession().getRandomIntegerForExecution(validEntities.length)]
        killAction = new KillAction(@getGameSession())
        killAction.setOwnerId(@getOwnerId())
        killAction.setTarget(unitToDestroy)
        @getGameSession().executeAction(killAction)

module.exports = ModifierDyingWishDestroyRandomEnemyNearby
