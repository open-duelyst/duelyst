ModifierSentinel = require './modifierSentinel'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'
i18next = require('i18next')

class ModifierSentinelOpponentSummon extends ModifierSentinel

  type:"ModifierSentinelOpponentSummon"
  @type:"ModifierSentinelOpponentSummon"

  @description: i18next.t("modifiers.sentinel_summon")

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description
    else
      return super()

  getCanReactToAction: (action) ->
    super(action) and @getGameSession().getCanCardBeScheduledForRemoval(@getCard())

  getIsActionRelevant: (action) ->
    # watch for a unit being summoned in any way by the opponent of player who owns this entity
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() isnt @getCard().getOwnerId() and action.getCard()?.type is CardType.Unit and action.getCard() isnt @getCard()
      # don't react to transforms
      if !(action instanceof PlayCardAsTransformAction or action instanceof CloneEntityAsTransformAction)
        return true
    return false

module.exports = ModifierSentinelOpponentSummon
