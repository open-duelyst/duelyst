ModifierSummonWatchAnyPlayerApplyModifiers = require './modifierSummonWatchAnyPlayerApplyModifiers'
UtilsGameSession = require 'app/common/utils/utils_game_session'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSummonWatchNearbyAnyPlayerApplyModifiers extends ModifierSummonWatchAnyPlayerApplyModifiers

  type:"ModifierSummonWatchNearbyAnyPlayerApplyModifiers"
  @type:"ModifierSummonWatchNearbyAnyPlayerApplyModifiers"

  @description: "ANY minion summoned nearby this minion %X"

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

  getIsValidBuffPosition: (summonedUnitPosition) ->
    entityPosition = @getCard().getPosition()
    if (Math.abs(summonedUnitPosition.x - entityPosition.x) <= 1) and (Math.abs(summonedUnitPosition.y - entityPosition.y) <= 1)
      return true
    else
      return false


module.exports = ModifierSummonWatchNearbyAnyPlayerApplyModifiers
