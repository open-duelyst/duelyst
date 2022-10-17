ModifierReplaceWatch = require './modifierReplaceWatch'

class ModifierReplaceWatchApplyModifiersToReplaced extends ModifierReplaceWatch

  type:"ModifierReplaceWatchApplyModifiersToReplaced"
  @type:"ModifierReplaceWatchApplyModifiersToReplaced"

  fxResource: ["FX.Modifiers.ModifierReplaceWatch"]

  modifierContextObjects: null

  @createContextObject: (modifierContextObjects, options=undefined) ->
    contextObject = super(options)
    contextObject.modifierContextObjects = modifierContextObjects
    return contextObject

  onReplaceWatch: (action) ->
    card = action.getReplacedCard()
    if @modifierContextObjects?
      for modifierContextObject in @modifierContextObjects
        if modifierContextObject?
          @getGameSession().applyModifierContextObject(modifierContextObject, card)

module.exports = ModifierReplaceWatchApplyModifiersToReplaced
