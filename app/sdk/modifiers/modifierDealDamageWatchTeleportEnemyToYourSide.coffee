ModifierDealDamageWatch = require './modifierDealDamageWatch'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class ModifierDealDamageWatchTeleportEnemyToYourSide extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchTeleportEnemyToYourSide"
  @type:"ModifierDealDamageWatchTeleportEnemyToYourSide"

  @modifierName:"Deal Damage Teleport Enemy"
  @description:"Whenever this minion deals damage to an enemy, teleport it to your starting side of the battlefield"

  onDealDamage: (action) ->

    enemy = action.getTarget()
    if enemy.getOwnerId() isnt @getCard().getOwnerId()

      randomTeleportAction = new RandomTeleportAction(@getGameSession())
      randomTeleportAction.setOwnerId(@getCard().getOwnerId())
      randomTeleportAction.setSource(enemy)
      if enemy.isOwnedByPlayer1() # if owned by player 1, we want to teleport onto player 2s side
        randomTeleportAction.setPatternSourcePosition({x: Math.ceil(CONFIG.BOARDCOL * 0.5), y:0})
      else if enemy.isOwnedByPlayer2() # if owned by player 2, we want to teleport onto player 1s side
        randomTeleportAction.setPatternSourcePosition({x:0, y:0})
      randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_HALF_BOARD)
      randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
      @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierDealDamageWatchTeleportEnemyToYourSide
