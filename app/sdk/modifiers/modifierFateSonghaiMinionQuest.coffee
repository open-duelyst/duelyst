ModifierFate = require './modifierFate'
CardType = require 'app/sdk/cards/cardType'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
ModifierQuestStatusSonghai = require './modifierQuestStatusSonghai'
_ = require 'underscore'

i18next = require('i18next')

class ModifierFateSonghaiMinionQuest extends ModifierFate

  type:"ModifierFateSonghaiMinionQuest"
  @type:"ModifierFateSonghaiMinionQuest"

  numDifferentCostsRequired: 1

  @createContextObject: (numDifferentCostsRequired, options) ->
    contextObject = super(options)
    contextObject.numDifferentCostsRequired = numDifferentCostsRequired
    return contextObject

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.minionCostsSummoned = null
    return p

  getMinionCostsSummoned: () ->
    if !@_private.minionCostsSummoned?
      @_private.minionCostsSummoned = []
      @checkFate(@getGameSession().filterActions(@getIsActionRelevant.bind(@)))
    return @_private.minionCostsSummoned

  updateFateCondition: (action) ->
    if @getIsActionRelevant(action)
      target = action.getTarget()
      if target?
        manaCost = target.getBaseManaCost()
        costAlreadyPlayed = false
        for cost in @getMinionCostsSummoned()
          if manaCost? and manaCost == cost
            costAlreadyPlayed = true
            break
        if !costAlreadyPlayed
          @getMinionCostsSummoned().push(manaCost)
          if @getMinionCostsSummoned().length < @numDifferentCostsRequired
            @removeQuestStatusModifier()
            @applyQuestStatusModifier(false)

    if @getMinionCostsSummoned().length >= @numDifferentCostsRequired
      @_private.fateFulfilled = true
      super() # unlock the card
      @removeQuestStatusModifier()
      @applyQuestStatusModifier(true)

  getIsActionRelevant: (action) ->
    if action.getOwnerId() == @getOwnerId()
      target = action.getTarget()
      if action instanceof PlayCardFromHandAction and target?.getType() is CardType.Unit
        return true
    return false

  onActivate: () ->
    super()
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if !general.hasActiveModifierClass(ModifierQuestStatusSonghai)
      @applyQuestStatusModifier(false)

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusSonghai)
      for mod in general.getModifiersByClass(ModifierQuestStatusSonghai)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusSonghai.createContextObject(questCompleted, @getMinionCostsSummoned())
    @getGameSession().applyModifierContextObject(countModifier, general)

  ascendingSort: (num) ->
    return num

module.exports = ModifierFateSonghaiMinionQuest
