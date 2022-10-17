CONFIG = require 'app/common/config'
ModifierBanding = require './modifierBanding'
ModifierBandedProvoke = require './modifierBandedProvoke'

class ModifierBandingProvoke extends ModifierBanding

  type:"ModifierBandingProvoke"
  @type:"ModifierBandingProvoke"

  @createContextObject: (options = undefined) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [ModifierBandedProvoke.createContextObject()]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

module.exports = ModifierBandingProvoke
