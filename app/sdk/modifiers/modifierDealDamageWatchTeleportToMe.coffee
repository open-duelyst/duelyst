Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
ModifierDealDamageWatch = require './modifierDealDamageWatch'
TeleportInFrontOfUnitAction = require 'app/sdk/actions/teleportInFrontOfUnitAction'
_ = require 'underscore'

class ModifierDealDamageWatchTeleportToMe extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchTeleportToMe"
  @type:"ModifierDealDamageWatchTeleportToMe"

  @modifierName:"Deal Damage Watch Teleport To Me"
  @description:"Minions damaged by Syvrel are pulled in front of him"

  maxStacks: 1

  onDealDamage: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      # calculate results of teleport only on server, since results may change at execution time
      target = action.getTarget()
      if target and !target.getIsGeneral()
        # move target in front of this minion
        teleAction = new TeleportInFrontOfUnitAction(@getGameSession(), @getCard(), target)
        teleAction.setFXResource(_.union(teleAction.getFXResource(), @getFXResource()))
        @getGameSession().executeAction(teleAction)

module.exports = ModifierDealDamageWatchTeleportToMe
