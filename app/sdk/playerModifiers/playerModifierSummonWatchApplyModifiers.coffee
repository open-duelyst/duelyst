PlayerModifierSummonWatch = require './playerModifierSummonWatch'

###
  Summon watch that remains active whether the original entity dies or not.
###
class PlayerModifierSummonWatchApplyModifiers extends PlayerModifierSummonWatch

  type:"PlayerModifierSummonWatchApplyModifiers"
  @type:"PlayerModifierSummonWatchApplyModifiers"

  @createContextObject: (modifiersContextObjects, buffDescription, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.buffDescription = buffDescription
    return contextObject

  onSummonWatch: (action) ->
    entity = action.getTarget()
    if entity?
      for modifierContextObject in @modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, entity)

module.exports = PlayerModifierSummonWatchApplyModifiers
