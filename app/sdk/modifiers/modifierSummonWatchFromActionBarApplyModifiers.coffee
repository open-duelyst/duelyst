ModifierSummonWatchApplyModifiers = require './modifierSummonWatchApplyModifiers'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSummonWatchFromActionBarApplyModifiers extends ModifierSummonWatchApplyModifiers

  type:"ModifierSummonWatchFromActionBarApplyModifiers"
  @type:"ModifierSummonWatchFromActionBarApplyModifiers"

  @description:"Minions summoned from your action bar, gain %X"

  getIsActionRelevant: (action) ->
    return action instanceof PlayCardFromHandAction and action.getCard() isnt @getCard() and super(action)
    # watch for a unit being summoned from action bar by the player who owns this entity, don't trigger on summon of this unit

module.exports = ModifierSummonWatchFromActionBarApplyModifiers
