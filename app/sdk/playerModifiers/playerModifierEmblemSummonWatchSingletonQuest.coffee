PlayerModifierEmblemGainMinionOrLoseControlWatch = require './playerModifierEmblemGainMinionOrLoseControlWatch'
ModifierQuestBuffNeutral = require 'app/sdk/modifiers/modifierQuestBuffNeutral'
CardType = require 'app/sdk/cards/cardType'

class PlayerModifierEmblemSummonWatchSingletonQuest extends PlayerModifierEmblemGainMinionOrLoseControlWatch

  type:"PlayerModifierEmblemSummonWatchSingletonQuest"
  @type:"PlayerModifierEmblemSummonWatchSingletonQuest"

  maxStacks: 1

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onGainMinionWatch: (action) ->
    entity = action.getTarget()
    if entity? and @modifiersContextObjects?
      for modifiersContextObject in @modifiersContextObjects
        if modifiersContextObject?
          modifiersContextObject.isRemovable = false
          @getGameSession().applyModifierContextObject(modifiersContextObject, entity)

  onLoseControlWatch: (action) ->
    entity = action.getTarget()
    if entity?
      modifiers = entity.getModifiers()
      if modifiers?
        for modifier in modifiers
          if modifier instanceof ModifierQuestBuffNeutral
            @getGameSession().removeModifier(modifier)

  onActivate: () ->
    super()
    if @modifiersContextObjects?
      for unit in @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
        if unit? and !unit.getIsGeneral() and unit.getType() == CardType.Unit and unit != @getSourceCard()
          for modifier in @modifiersContextObjects
            if modifier?
              modifier.isRemovable = false
              @getGameSession().applyModifierContextObject(modifier, unit)

module.exports = PlayerModifierEmblemSummonWatchSingletonQuest
