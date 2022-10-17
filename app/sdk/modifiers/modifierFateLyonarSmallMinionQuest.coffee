ModifierFate = require './modifierFate'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'
ModifierQuestStatusLyonar = require './modifierQuestStatusLyonar'
_ = require 'underscore'

i18next = require('i18next')

class ModifierFateLyonarSmallMinionQuest extends ModifierFate

  type:"ModifierFateLyonarSmallMinionQuest"
  @type:"ModifierFateLyonarSmallMinionQuest"

  numMinionsRequired: 1

  @createContextObject: (numMinionsRequired, options) ->
    contextObject = super(options)
    contextObject.numMinionsRequired = numMinionsRequired
    return contextObject

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.minionsSummonIds = null
    return p

  getMinionsSummonedIds: () ->
    if !@_private.minionsSummonIds?
      @_private.minionsSummonIds = []
      @checkFate(@getGameSession().filterActions(@getIsActionRelevant.bind(@)))
    return @_private.minionsSummonIds

  updateFateCondition: (action) ->
    if @getIsActionRelevant(action)
      if ! _.contains(@getMinionsSummonedIds(), action.getTarget().getIndex())
        @getMinionsSummonedIds().push(action.getTarget().getIndex())
      if @getMinionsSummonedIds().length < @numMinionsRequired
        @removeQuestStatusModifier()
        @applyQuestStatusModifier(false)

    if @getMinionsSummonedIds().length >= @numMinionsRequired
      @_private.fateFulfilled = true
      super() # unlock the card
      @removeQuestStatusModifier()
      @applyQuestStatusModifier(true)

  getIsActionRelevant: (action) ->
    if action.getOwnerId() == @getOwnerId()
      target = action.getTarget()
      if target? and action instanceof ApplyCardToBoardAction and action.getCard()?.type is CardType.Unit and !(action instanceof PlayCardAsTransformAction or action instanceof CloneEntityAsTransformAction)
        if target.getBaseATK() <= 1
          return true
    return false

  onActivate: () ->
    super()
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if !general.hasActiveModifierClass(ModifierQuestStatusLyonar)
      @applyQuestStatusModifier(false)

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusLyonar)
      for mod in general.getModifiersByClass(ModifierQuestStatusLyonar)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusLyonar.createContextObject(questCompleted, @getMinionsSummonedIds().length)
    @getGameSession().applyModifierContextObject(countModifier, general)

module.exports = ModifierFateLyonarSmallMinionQuest
