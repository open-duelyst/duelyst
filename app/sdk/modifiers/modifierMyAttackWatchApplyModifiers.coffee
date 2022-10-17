ModifierMyAttackWatch = require './modifierMyAttackWatch'

class ModifierMyAttackWatchApplyModifiers extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchApplyModifiers"
  @type:"ModifierMyAttackWatchApplyModifiers"

  modifiersContextObjects: null

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  onMyAttackWatch: (action) ->

    if @modifiersContextObjects?
      for modifier in @modifiersContextObjects
        if modifier?
          @getGameSession().applyModifierContextObject(modifier, @getCard())

module.exports = ModifierMyAttackWatchApplyModifiers
