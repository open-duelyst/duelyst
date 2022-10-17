ModifierEntersBattlefieldWatch = require './modifierEntersBattlefieldWatch'

class ModifierEntersBattlefieldWatchApplyModifiers extends ModifierEntersBattlefieldWatch

  type:"ModifierEntersBattlefieldWatchApplyModifiers"
  @type:"ModifierEntersBattlefieldWatchApplyModifiers"

  modifiersContextObjects: null

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onEntersBattlefield: () ->

    if @modifiersContextObjects?
      for modifiersContextObject in @modifiersContextObjects
        if modifiersContextObject?
          @getGameSession().applyModifierContextObject(modifiersContextObject, @getCard())

module.exports = ModifierEntersBattlefieldWatchApplyModifiers
