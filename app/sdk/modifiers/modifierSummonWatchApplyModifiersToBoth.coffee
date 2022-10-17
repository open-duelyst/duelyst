ModifierSummonWatch = require './modifierSummonWatch'

class ModifierSummonWatchApplyModifiersToBoth extends ModifierSummonWatch

  type:"ModifierSummonWatchApplyModifiersToBoth"
  @type:"ModifierSummonWatchApplyModifiersToBoth"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, buffDescription, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.buffDescription = buffDescription
    return contextObject

  onSummonWatch: (action) ->

    if @modifiersContextObjects?
      summonedUnitPosition = action.getTarget()?.getPosition()
      if @getIsValidBuffPosition(summonedUnitPosition)

        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())
          
        entity = action.getTarget()
        if entity?
          for modifierContextObject in @modifiersContextObjects
            @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getIsValidBuffPosition: (summonedUnitPosition) ->
    # override this in subclass to filter by position
    return true

module.exports = ModifierSummonWatchApplyModifiersToBoth
