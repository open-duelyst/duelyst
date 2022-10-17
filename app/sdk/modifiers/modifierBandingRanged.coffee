CONFIG =         require 'app/common/config'
ModifierBanding =   require './modifierBanding'
ModifierBandedRanged =     require './modifierBandedRanged'

class ModifierBandingRanged extends ModifierBanding

  type:"ModifierBandingRanged"
  @type:"ModifierBandingRanged"

  #@modifierName:"Zeal"

  #maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealRanged"]

  @createContextObject: (options = undefined) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [ModifierBandedRanged.createContextObject()]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

module.exports = ModifierBandingRanged
