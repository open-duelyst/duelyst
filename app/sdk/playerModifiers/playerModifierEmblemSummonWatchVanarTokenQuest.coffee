PlayerModifierEmblemGainMinionOrLoseControlWatch = require './playerModifierEmblemGainMinionOrLoseControlWatch'
ModifierQuestBuffVanar = require 'app/sdk/modifiers/modifierQuestBuffVanar'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'

class PlayerModifierEmblemSummonWatchVanarTokenQuest extends PlayerModifierEmblemGainMinionOrLoseControlWatch

  type:"PlayerModifierEmblemSummonWatchVanarTokenQuest"
  @type:"PlayerModifierEmblemSummonWatchVanarTokenQuest"

  maxStacks: 1

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onGainMinionWatch: (action) ->
    unit = action.getTarget()
    if unit? and @modifiersContextObjects? and unit.getRarityId() is Rarity.TokenUnit
      for modifiersContextObject in @modifiersContextObjects
        if modifiersContextObject?
          modifiersContextObject.isRemovable = false
          @getGameSession().applyModifierContextObject(modifiersContextObject, unit)

  onLoseControlWatch: (action) ->
    entity = action.getTarget()
    if entity?
      modifiers = entity.getModifiers()
      if modifiers?
        for modifier in modifiers
          if modifier instanceof ModifierQuestBuffVanar
            @getGameSession().removeModifier(modifier)

  onActivate: () ->
    super()
    if @modifiersContextObjects?
      for unit in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
        if unit? and !unit.getIsGeneral() and unit.getType() == CardType.Unit and unit.getRarityId() is Rarity.TokenUnit
          for modifier in @modifiersContextObjects
            if modifier?
              modifier.isRemovable = false
              @getGameSession().applyModifierContextObject(modifier, unit)

module.exports = PlayerModifierEmblemSummonWatchVanarTokenQuest
