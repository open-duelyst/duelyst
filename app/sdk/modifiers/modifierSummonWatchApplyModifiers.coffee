ModifierSummonWatch = require './modifierSummonWatch'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSummonWatchApplyModifiers extends ModifierSummonWatch

  type:"ModifierSummonWatchApplyModifiers"
  @type:"ModifierSummonWatchApplyModifiers"

  @description: "Other minions you summon %X"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, buffDescription, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.buffDescription = buffDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.buffDescription
    else
      return @description

  onSummonWatch: (action) ->
    summonedUnitPosition = action.getTarget()?.getPosition()

    if @modifiersContextObjects? and @getIsValidBuffPosition(summonedUnitPosition)
      entity = action.getTarget()
      if entity?
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getIsValidBuffPosition: (summonedUnitPosition) ->
    # override this in subclass to filter by position
    return true

module.exports = ModifierSummonWatchApplyModifiers
