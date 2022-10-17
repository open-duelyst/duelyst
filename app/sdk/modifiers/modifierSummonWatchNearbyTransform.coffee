ModifierSummonWatchTransform = require './modifierSummonWatchTransform'

class ModifierSummonWatchNearbyTransform extends ModifierSummonWatchTransform

  type:"ModifierSummonWatchNearbyTransform"
  @type:"ModifierSummonWatchNearbyTransform"

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  getIsValidTransformPosition: (summonedUnitPosition) ->
    entityPosition = @getCard().getPosition()
    if (Math.abs(summonedUnitPosition.x - entityPosition.x) <= 1) and (Math.abs(summonedUnitPosition.y - entityPosition.y) <= 1)
      return true
    else
      return false

module.exports = ModifierSummonWatchNearbyTransform
