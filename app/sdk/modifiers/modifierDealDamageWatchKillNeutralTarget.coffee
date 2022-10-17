EVENTS = require 'app/common/event_types'
ModifierDealDamageWatchKillTarget = require './modifierDealDamageWatchKillTarget'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
ModifierDealDamageWatch = require './modifierDealDamageWatch'
KillAction = require 'app/sdk/actions/killAction'

class ModifierDealDamageWatchKillNeutralTarget extends ModifierDealDamageWatchKillTarget

  type:"ModifierDealDamageWatchKillNeutralTarget"
  @type:"ModifierDealDamageWatchKillNeutralTarget"

  @modifierName:"Neutral Assassin"
  @description:"Whenever this damages a neutral minion, destroy that minion"

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch", "FX.Modifiers.ModifierGenericKill"]

  getIsActionRelevant: (a) ->
    # kill the target as long as it satisfies base requirements AND is Neutral
    return super(a) and (a.getTarget()?.getFactionId() == Factions.Neutral)

  onDealDamage: (action) ->
    target = action.getTarget()
    if target.getFactionId() == Factions.Neutral
      super(action)

module.exports = ModifierDealDamageWatchKillNeutralTarget
