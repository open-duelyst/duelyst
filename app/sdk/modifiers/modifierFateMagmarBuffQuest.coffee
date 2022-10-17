ModifierFate = require './modifierFate'
CardType = require 'app/sdk/cards/cardType'
DieAction = require 'app/sdk/actions/dieAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'
ApplyModifierAction = require 'app/sdk/actions/applyModifierAction'
ModifierQuestStatusMagmar = require './modifierQuestStatusMagmar'
_ = require 'underscore'

i18next = require('i18next')

class ModifierFateMagmarBuffQuest extends ModifierFate

  type:"ModifierFateMagmarBuffQuest"
  @type:"ModifierFateMagmarBuffQuest"

  attackBuffCount: 1

  @createContextObject: (attackBuffCount, options) ->
    contextObject = super(options)
    contextObject.attackBuffCount = attackBuffCount
    return contextObject

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.buffSpellActionIndices = null
    return p

  getNumBuffSpells: () ->
    if !@_private.buffSpellActionIndices?
      @_private.buffSpellActionIndices = []
      @checkFate(@getGameSession().filterActions(@getIsActionRelevant.bind(@)))
    return @_private.buffSpellActionIndices

  updateFateCondition: (action) ->
    if action?
      if @getIsActionRelevant(action)
        if ! _.contains(@getNumBuffSpells(), action.getRootAction().getIndex())
          @getNumBuffSpells().push(action.getRootAction().getIndex())
          if @getNumBuffSpells().length < @attackBuffCount
            @removeQuestStatusModifier()
            @applyQuestStatusModifier(false)

    if @getNumBuffSpells().length >= @attackBuffCount
      @_private.fateFulfilled = true
      super() # unlock the card
      @removeQuestStatusModifier()
      @applyQuestStatusModifier(true)

  getIsActionRelevant: (action) ->
    if action.getOwnerId() == @getOwnerId()
      if (action.getRootAction() instanceof PlayCardFromHandAction or action.getRootAction() instanceof PlaySignatureCardAction) and action.getRootAction().getCard()?.type is CardType.Spell
        if action instanceof ApplyModifierAction and action.getModifier().getBuffsAttribute("atk") and !action.getTarget().getIsGeneral?()
          modifier = action.getModifier()
          if modifier.getBuffsAttribute("atk") and modifier.attributeBuffs["atk"] > 0 and !modifier.getRebasesAttribute("atk") and !modifier.getBuffsAttributeAbsolutely("atk")
            if action.getTarget().getAppliedToBoardByAction()?.getRootAction() isnt action.getRootAction()
              return true
    return false

  onActivate: () ->
    super()
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if !general.hasActiveModifierClass(ModifierQuestStatusMagmar)
      @applyQuestStatusModifier(false)

  removeQuestStatusModifier: () ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if general.hasActiveModifierClass(ModifierQuestStatusMagmar)
      for mod in general.getModifiersByClass(ModifierQuestStatusMagmar)
        @getGameSession().removeModifier(mod)

  applyQuestStatusModifier: (questCompleted) ->
    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    countModifier = ModifierQuestStatusMagmar.createContextObject(questCompleted, @getNumBuffSpells().length)
    @getGameSession().applyModifierContextObject(countModifier, general)

module.exports = ModifierFateMagmarBuffQuest
