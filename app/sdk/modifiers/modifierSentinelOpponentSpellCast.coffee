ModifierSentinel = require './modifierSentinel'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require('i18next')

class ModifierSentinelOpponentSpellCast extends ModifierSentinel

  type:"ModifierSentinelOpponentSpellCast"
  @type:"ModifierSentinelOpponentSpellCast"

  @description: i18next.t("modifiers.sentinel_spell_cast")

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description
    else
      return super()

  getIsActionRelevant: (action) ->
    if action.getOwner() is @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()) and action instanceof ApplyCardToBoardAction and action.getIsValid()
      card = action.getCard()
      # watch for a spell being cast, but ignore followups! (like opening gambits)
      if card? and card.getRootCard()?.type is CardType.Spell
        return true
    return false

module.exports = ModifierSentinelOpponentSpellCast
