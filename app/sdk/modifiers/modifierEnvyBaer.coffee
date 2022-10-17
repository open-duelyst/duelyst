ModifierDealDamageWatch = require './modifierDealDamageWatch'
RandomTeleportAction = require 'app/sdk/actions/randomTeleportAction'
CONFIG = require 'app/common/config'
_ = require 'underscore'

class ModifierEnvyBaer extends ModifierDealDamageWatch

  type:"ModifierEnvyBaer"
  @type:"ModifierEnvyBaer"

  @modifierName:"Envybaer"
  @description:"Whenever this minion damages an enemy, teleport that enemy to a random corner"

  maxStacks: 1

  onDealDamage: (action) ->
    if action.getTarget().getOwnerId() isnt @getCard().getOwnerId()
      randomTeleportAction = new RandomTeleportAction(@getGameSession())
      randomTeleportAction.setOwnerId(@getCard().getOwnerId())
      randomTeleportAction.setSource(action.getTarget())
      randomTeleportAction.setTeleportPattern(CONFIG.PATTERN_CORNERS)
      randomTeleportAction.setFXResource(_.union(randomTeleportAction.getFXResource(), @getFXResource()))
      @getGameSession().executeAction(randomTeleportAction)

module.exports = ModifierEnvyBaer
