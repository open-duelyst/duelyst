ModifierSynergize = require './modifierSynergize'

class ModifierSynergizeBuffSelf extends ModifierSynergize

  type:"ModifierSynergizeBuffSelf"
  @type:"ModifierSynergizeBuffSelf"

  fxResource: ["FX.Modifiers.ModifierSynergize"]

  modifiers: null

  @createContextObject: (modifiers, options=undefined) ->
    contextObject = super(options)
    contextObject.modifiers = modifiers
    return contextObject

  onSynergize: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiers, @getCard())

module.exports = ModifierSynergizeBuffSelf
