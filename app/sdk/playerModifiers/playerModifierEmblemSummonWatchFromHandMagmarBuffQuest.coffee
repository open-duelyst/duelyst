PlayerModifierEmblemSummonWatch = require './playerModifierEmblemSummonWatch'
CardType = require 'app/sdk/cards/cardType'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

class PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest extends PlayerModifierEmblemSummonWatch

  type:"PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest"
  @type:"PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest"

  maxStacks: 1

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onSummonWatch: (action) ->
    if action instanceof PlayCardFromHandAction
      entity = action.getTarget()
      if entity? and @modifiersContextObjects?
        for modifiersContextObject in @modifiersContextObjects
          if modifiersContextObject?
            modifiersContextObject.isRemovable = false
            #Set this parent of buff, so it's known the modifier originates from an emblem
            @getGameSession().applyModifierContextObject(modifiersContextObject, entity, @)

module.exports = PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest
