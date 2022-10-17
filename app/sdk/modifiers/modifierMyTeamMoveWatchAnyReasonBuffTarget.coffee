ModifierMyTeamMoveWatchAnyReason = require './modifierMyTeamMoveWatchAnyReason'

class ModifierMyTeamMoveWatchAnyReasonBuffTarget extends ModifierMyTeamMoveWatchAnyReason

  type:"ModifierMyTeamMoveWatchAnyReasonBuffTarget"
  @type:"ModifierMyTeamMoveWatchAnyReasonBuffTarget"

  @modifierName:"My Team Move Watch Any Reason Buff Target"
  @description: "Whenever a friendly minion is moved for any reason, %Y"

  fxResource: ["FX.Modifiers.ModifierMyTeamMoveWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modContextObject, description, options=undefined) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modContextObject
    contextObject.modDescription = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%Y/, modifierContextObject.modDescription
    else
      return @description

  onMyTeamMoveWatch: (action, buffTarget) ->
    # apply modifiers to card being summoned
    if buffTarget?
      for modifierContextObject in @modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, buffTarget)

module.exports = ModifierMyTeamMoveWatchAnyReasonBuffTarget
