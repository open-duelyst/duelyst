CONFIG = require 'app/common/config'
ModifierBanding = require './modifierBanding'
ModifierBandedFlying = require './modifierBandedFlying'

class ModifierBandingFlying extends ModifierBanding

  type:"ModifierBandingFlying"
  @type:"ModifierBandingFlying"

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierFlying"]

  @createContextObject: (options = undefined) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [ModifierBandedFlying.createContextObject()]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

module.exports = ModifierBandingFlying
