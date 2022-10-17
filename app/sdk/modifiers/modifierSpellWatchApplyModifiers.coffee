Modifier = require './modifier'
ModifierSpellWatch = require './modifierSpellWatch'

class ModifierSpellWatchApplyModifiers extends ModifierSpellWatch

  type:"ModifierSpellWatchApplyModifiers"
  @type:"ModifierSpellWatchApplyModifiers"

  @modifierName:"Spell Watch"
  @description: "Whenever you cast a spell, apply a modifier to this minion"

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiers, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiers
    return contextObject

  onSpellWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierSpellWatchApplyModifiers
