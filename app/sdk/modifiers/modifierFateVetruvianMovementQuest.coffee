ModifierFate = require './modifierFate'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
MoveAction = require 'app/sdk/actions/moveAction'
TeleportAction = require 'app/sdk/actions/teleportAction'
SwapGeneralAction = require 'app/sdk/actions/swapGeneralAction'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'
PlayerModifierEmblemSituationalVetQuestFrenzy = require 'app/sdk/playerModifiers/playerModifierEmblemSituationalVetQuestFrenzy'
ModifierQuestStatusVetruvian = require './modifierQuestStatusVetruvian'

i18next = require('i18next')

class ModifierFateVetruvianMovementQuest extends ModifierFate

  type:"ModifierFateVetruvianMovementQuest"
  @type:"ModifierFateVetruvianMovementQuest"

  onActivate: () ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if (general? and general.hasActiveModifierClass(PlayerModifierEmblemSituationalVetQuestFrenzy)) or @questRequirementMet()
      @_private.fateFulfilled = true
      @unlockFateCard()
      if !general.hasActiveModifierClass(ModifierQuestStatusVetruvian)
        @applyQuestStatusModifier(true)
    else
      if !general.hasActiveModifierClass(ModifierQuestStatusVetruvian)
        @applyQuestStatusModifier(false)

  updateFateCondition: (action) ->
    if @getIsActionRelevant(action) and @questRequirementMet()
      @_private.fateFulfilled = true
      super()
      @removeQuestStatusModifier()
      @applyQuestStatusModifier(true)

  questRequirementMet: (action) ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    columnToReach = 0
    if @getCard().isOwnedByPlayer1()
      columnToReach = 8
    else
      columnToReach = 0
    if general.getPosition().x == columnToReach
      modifiersByArtifact = general.getArtifactModifiersGroupedByArtifactCard()
      if modifiersByArtifact.length > 0
        return true
    return false

  getIsActionRelevant: (action) ->
    if action instanceof ApplyCardToBoardAction or action instanceof MoveAction or action instanceof TeleportAction or action instanceof SwapGeneralAction or action instanceof SwapUnitsAction
      return true
    return false

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusVetruvian)
      for mod in general.getModifiersByClass(ModifierQuestStatusVetruvian)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusVetruvian.createContextObject()
    countModifier.appliedName = i18next.t("modifiers.vetruvianquest_counter_applied_name")
    if questCompleted
      countModifier.appliedDescription = i18next.t("modifiers.quest_completed_applied_desc")
    else
      countModifier.appliedDescription = i18next.t("modifiers.vetruvianquest_counter_applied_desc")
    @getGameSession().applyModifierContextObject(countModifier, general)

module.exports = ModifierFateVetruvianMovementQuest
