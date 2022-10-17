ModifierSummonWatch = require './modifierSummonWatch'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

class ModifierSummonWatchFromActionBar extends ModifierSummonWatch

  type:"ModifierSummonWatchFromActionBar"
  @type:"ModifierSummonWatchFromActionBar"

  @description:"Whenever you summon a minion from your action bar, do something"

  getIsActionRelevant: (action) ->
    return action instanceof PlayCardFromHandAction and action.getCard() isnt @getCard() and super(action)
    # watch for a unit being summoned from action bar by the player who owns this entity, don't trigger on summon of this unit

module.exports = ModifierSummonWatchFromActionBar