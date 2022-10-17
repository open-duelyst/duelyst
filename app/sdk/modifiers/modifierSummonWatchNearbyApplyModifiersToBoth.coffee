ModifierSummonWatchApplyModifiersToBoth = require './modifierSummonWatchApplyModifiersToBoth'

class ModifierSummonWatchNearbyApplyModifiersToBoth extends ModifierSummonWatchApplyModifiersToBoth

  type:"ModifierSummonWatchNearbyApplyModifiersToBoth"
  @type:"ModifierSummonWatchNearbyApplyModifiersToBoth"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    return contextObject

  getIsValidBuffPosition: (summonedUnitPosition) ->
    entityPosition = @getCard().getPosition()
    if (Math.abs(summonedUnitPosition.x - entityPosition.x) <= 1) and (Math.abs(summonedUnitPosition.y - entityPosition.y) <= 1)
      return true
    else
      return false


module.exports = ModifierSummonWatchNearbyApplyModifiersToBoth
