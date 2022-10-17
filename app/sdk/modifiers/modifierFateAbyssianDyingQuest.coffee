ModifierFate = require './modifierFate'
CardType = require 'app/sdk/cards/cardType'
DieAction = require 'app/sdk/actions/dieAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
ModifierQuestStatusAbyssian = require './modifierQuestStatusAbyssian'
_ = require 'underscore'

i18next = require('i18next')

class ModifierFateAbyssianDyingQuest extends ModifierFate

  type:"ModifierFateAbyssianDyingQuest"
  @type:"ModifierFateAbyssianDyingQuest"

  deathCountRequired: 1

  @createContextObject: (deathCountRequired, options) ->
    contextObject = super(options)
    contextObject.deathCountRequired = deathCountRequired
    return contextObject

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.deathSpellActionIndices = null
    return p

  getDeathSpellActionIndices: () ->
    if !@_private.deathSpellActionIndices?
      @_private.deathSpellActionIndices = []
      @checkFate(@getGameSession().filterActions(@getIsActionRelevant.bind(@)))
    return @_private.deathSpellActionIndices

  updateFateCondition: (action) ->
    if @getIsActionRelevant(action)
      if ! _.contains(@getDeathSpellActionIndices(), action.getRootAction().getIndex())
        @getDeathSpellActionIndices().push(action.getRootAction().getIndex())
      if @getDeathSpellActionIndices().length < @deathCountRequired
        @removeQuestStatusModifier()
        @applyQuestStatusModifier(false)

    if @getDeathSpellActionIndices().length >= @deathCountRequired
      @_private.fateFulfilled = true
      super() # unlock the card
      @removeQuestStatusModifier()
      @applyQuestStatusModifier(true)

  getIsActionRelevant: (action) ->
    if action.getOwnerId() == @getOwnerId()
      target = action.getTarget()
      if target? and action instanceof DieAction and target.getType() is CardType.Unit and target.getOwnerId() == @getCard().getOwnerId()
        if (action.getRootAction() instanceof PlayCardFromHandAction or action.getRootAction() instanceof PlaySignatureCardAction) and action.getRootAction().getCard()?.type is CardType.Spell
          return true
    return false

  onActivate: () ->
    super()
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if !general.hasActiveModifierClass(ModifierQuestStatusAbyssian)
      @applyQuestStatusModifier(false)

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusAbyssian)
      for mod in general.getModifiersByClass(ModifierQuestStatusAbyssian)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusAbyssian.createContextObject(questCompleted, @getDeathSpellActionIndices().length)
    @getGameSession().applyModifierContextObject(countModifier, general)

module.exports = ModifierFateAbyssianDyingQuest
