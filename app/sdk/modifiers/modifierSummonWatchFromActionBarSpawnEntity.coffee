ModifierSummonWatchSpawnEntity = require './modifierSummonWatchSpawnEntity'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSummonWatchFromActionBarSpawnEntity extends ModifierSummonWatchSpawnEntity

  type:"ModifierSummonWatchFromActionBarSpawnEntity"
  @type:"ModifierSummonWatchFromActionBarSpawnEntity"

  @description:"Whenever you summon a minion from your action bar, summon %X"

  getIsActionRelevant: (action) ->
    return action instanceof PlayCardFromHandAction and action.getCard() isnt @getCard() and super(action)
    # watch for a unit being summoned from action bar by the player who owns this entity, don't trigger on summon of this unit

module.exports = ModifierSummonWatchFromActionBarSpawnEntity
