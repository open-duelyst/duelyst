ModifierAnySummonWatchFromActionBar = require './modifierAnySummonWatchFromActionBar'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'
i18next = require 'i18next'

class ModifierAnySummonWatchFromActionBarApplyModifiersToSelf extends ModifierAnySummonWatchFromActionBar

  type:"ModifierAnySummonWatchFromActionBarApplyModifiersToSelf"
  @type:"ModifierAnySummonWatchFromActionBarApplyModifiersToSelf"

  @description:i18next.t("modifiers.any_summon_watch_from_action_bar_apply_modifiers_def")

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiersContextObjects, buffDescription, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = modifiersContextObjects
    contextObject.buffDescription = buffDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.any_summon_watch_from_action_bar_apply_modifiers_def",{desc:@buffDescription})
    else
      return @description

  onSummonWatch: (action) ->
    if @modifiersContextObjects?
      for modifierContextObject in @modifiersContextObjects
        @getGameSession().applyModifierContextObject(modifierContextObject, @getCard())

module.exports = ModifierAnySummonWatchFromActionBarApplyModifiersToSelf
