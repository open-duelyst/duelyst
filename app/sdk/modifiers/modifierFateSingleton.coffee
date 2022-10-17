ModifierFate = require './modifierFate'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
RemoveCardFromDeckAction = require 'app/sdk/actions/removeCardFromDeckAction'
PutCardInDeckAction = require 'app/sdk/actions/putCardInDeckAction'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
PlayerModifierEmblemSummonWatchSingletonQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchSingletonQuest'
ModifierQuestStatusNeutral = require './modifierQuestStatusNeutral'
Cards = require 'app/sdk/cards/cardsLookupComplete'

i18next = require('i18next')

class ModifierFateSingleton extends ModifierFate

  type:"ModifierFateSingleton"
  @type:"ModifierFateSingleton"

  onActivate: () ->
    if @getGameSession().getIsRunningAsAuthoritative()
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      if (general? and general.hasActiveModifierClass(PlayerModifierEmblemSummonWatchSingletonQuest)) or !@checkDeckForDuplicates()
        @_private.fateFulfilled = true
        @unlockFateCard()
        if !general.hasActiveModifierClass(ModifierQuestStatusNeutral)
          @applyQuestStatusModifier(true)
      else
        if !general.hasActiveModifierClass(ModifierQuestStatusNeutral)
          @applyQuestStatusModifier(false)

  updateFateCondition: (action) ->
    if @getIsActionRelevant(action) and !@checkDeckForDuplicates()
      @_private.fateFulfilled = true
      super()
      general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      @removeQuestStatusModifier()
      @applyQuestStatusModifier(true)

  checkDeckForDuplicates: () ->
    hasDuplicate = false
    deckCards = @getGameSession().getPlayerSetupDataForPlayerId(@getCard().getOwnerId()).deck
    checkedCardIds = []
    for card in deckCards
      for checkedId in checkedCardIds
        if Cards.getBaseCardId(card.id) == checkedId
          hasDuplicate = true
          break
      if !hasDuplicate
        checkedCardIds.push(Cards.getBaseCardId(card.id))
      else
        break

    return hasDuplicate

  fateConditionFulfilled: () ->
    return !@checkDeckForDuplicates()

  getIsActionRelevant: (action) ->
    if action.getOwnerId() == @getOwnerId()
      if action instanceof DrawCardAction or action instanceof RemoveCardFromDeckAction or action instanceof PutCardInDeckAction or action instanceof PutCardInHandAction
        return true
    return false

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusNeutral)
      for mod in general.getModifiersByClass(ModifierQuestStatusNeutral)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusNeutral.createContextObject()
    countModifier.appliedName = i18next.t("modifiers.neutralquest_counter_applied_name")
    if questCompleted
      countModifier.appliedDescription = i18next.t("modifiers.quest_completed_applied_desc")
    else
      countModifier.appliedDescription = i18next.t("modifiers.neutralquest_counter_applied_desc")
    @getGameSession().applyModifierContextObject(countModifier, general)

module.exports = ModifierFateSingleton
