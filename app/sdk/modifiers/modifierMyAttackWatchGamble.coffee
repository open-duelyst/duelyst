ModifierMyAttackWatch = require './modifierMyAttackWatch'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'
CONFIG = require 'app/common/config'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyAttackWatchGamble extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchGamble"
  @type:"ModifierMyAttackWatchGamble"

  @modifierName:"Attack Watch: Gamble"
  @description:"Whenever this minion attacks, it has a 50% chance to attack again"

  fxResource: ["FX.Modifiers.ModifierMyAttackWatchGamble"]

  onMyAttackWatch: (action) ->
    # 50% chance to attack again
    if @getGameSession().getIsRunningAsAuthoritative() and Math.random() > .5
      attackAction = new ForcedAttackAction(@getGameSession())
      attackAction.setOwnerId(@getCard().getOwnerId())
      attackAction.setSource(@getCard())
      attackAction.setDamageAmount(@getCard().getATK())
      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, CONFIG.WHOLE_BOARD_RADIUS)
      validEntities = []
      for entity in entities
        validEntities.push(entity)

      if validEntities.length > 0
        unitToDamage = validEntities[@getGameSession().getRandomIntegerForExecution(validEntities.length)]

        attackAction.setTarget(unitToDamage)
        attackAction.setIsAutomatic(true) # act like an explict attack even though this is auto generated
        @getGameSession().executeAction(attackAction) # execute attack

  # special case - this needs to be able to react to attack actions that it creates (so it can keep chaining attacks)
  getCanReactToAction: (action) ->
    return super() or action instanceof ForcedAttackAction and @getIsAncestorForAction(action)

module.exports = ModifierMyAttackWatchGamble
