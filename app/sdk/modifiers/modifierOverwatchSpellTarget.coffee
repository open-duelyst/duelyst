ModifierOverwatch = require './modifierOverwatch'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
UtilsPosition = require 'app/common/utils/utils_position'
CardType = require 'app/sdk/cards/cardType'

class ModifierOverwatchSpellTarget extends ModifierOverwatch

  type:"ModifierOverwatchSpellTarget"
  @type:"ModifierOverwatchSpellTarget"

  @description: "When this is the target of an enemy spell, %X"

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description.replace /%X/, modifierContextObject.description
    else
      return super()

  getIsActionRelevant: (action) ->
    if @getCard()? and action.getOwner() is @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()) and action instanceof ApplyCardToBoardAction and action.getIsValid() and UtilsPosition.getPositionsAreEqual(@getCard().getPosition(), action.getTargetPosition()) # may be trying to target this unit
      card = action.getCard()
      # is this in fact an enemy spell directly trying to target this unit? (not this space, not multiple spaces - directly targeting this unit)
      if card? and card.getRootCard()?.type is CardType.Spell and !card.getTargetsSpace() and !card.getAppliesSameEffectToMultipleTargets()
        return true
    return false

module.exports = ModifierOverwatchSpellTarget
