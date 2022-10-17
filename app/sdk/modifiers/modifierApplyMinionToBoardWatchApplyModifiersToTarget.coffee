Modifier = require './modifier'
ModifierApplyMinionToBoardWatch = require './modifierApplyMinionToBoardWatch'

i18next = require 'i18next'

class ModifierApplyMinionToBoardWatchApplyModifiersToTarget extends ModifierApplyMinionToBoardWatch

  type:"ModifierApplyMinionToBoardWatchApplyModifiersToTarget"
  @type:"ModifierApplyMinionToBoardWatchApplyModifiersToTarget"

  @modifierName:i18next.t("modifiers.apply_minion_to_board_watch_apply_modifiers_to_target_name")
  @description:i18next.t("modifiers.apply_minion_to_board_watch_apply_modifiers_to_target_def")

  fxResource: ["FX.Modifiers.ModifierApplyMinionToBoardWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, buffDescription, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.buffDescription = buffDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.apply_minion_to_board_watch_apply_modifiers_to_target_def",{desc:@buffDescription})
    else
      return @description

  onApplyToBoardWatch: (action) ->
    summonedUnitPosition = action.getTarget()?.getPosition()

    if @modifiersContextObjects?
      entity = action.getTarget()
      if entity?
        for modifierContextObject in @modifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, entity)

module.exports = ModifierApplyMinionToBoardWatchApplyModifiersToTarget
