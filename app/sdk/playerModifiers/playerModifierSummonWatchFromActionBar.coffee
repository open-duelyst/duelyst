PlayerModifierSummonWatch = require './playerModifierSummonWatch'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

class PlayerModifierSummonWatchFromActionBar extends PlayerModifierSummonWatch

  type:"PlayerModifierSummonWatchFromActionBar"
  @type:"PlayerModifierSummonWatchFromActionBar"

  getIsActionRelevant: (action) ->
    return action instanceof PlayCardFromHandAction and super(action)
    # watch for a unit being summoned from action bar by the player who owns this entity

module.exports = PlayerModifierSummonWatchFromActionBar