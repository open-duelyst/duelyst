Modifier = require './modifier'

i18next = require('i18next')

class ModifierCounterShadowCreepDescriptionProgressDescription extends Modifier

  type:"ModifierCounterShadowCreepDescriptionProgressDescription"
  @type:"ModifierCounterShadowCreepDescriptionProgressDescription"

  maxStacks: 1

  @createContextObject: (tileCount) ->
    contextObject = super()
    contextObject.tileCount = tileCount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.shadowcreep_counter_applied_desc",{tile_count: modifierContextObject.tileCount})

module.exports = ModifierCounterShadowCreepDescriptionProgressDescription
