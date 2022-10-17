ModifierBackstabWatch = require './modifierBackstabWatch'

class ModifierBackstabWatchApplyModifiersToTarget extends ModifierBackstabWatch

  type:"ModifierBackstabWatchApplyModifiersToTarget"
  @type:"ModifierBackstabWatchApplyModifiersToTarget"

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onBackstabWatch: (action) ->

    target = action.getTarget()
    if target? and @modifiersContextObjects?
      for modifier in @modifiersContextObjects
        if modifier?
          @getGameSession().applyModifierContextObject(modifier, target)

module.exports = ModifierBackstabWatchApplyModifiersToTarget
