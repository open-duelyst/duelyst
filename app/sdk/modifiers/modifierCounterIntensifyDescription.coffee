Modifier = require './modifier'

i18next = require('i18next')

class ModifierCounterIntensifyDescription extends Modifier

  type:"ModifierCounterIntensifyDescription"
  @type:"ModifierCounterIntensifyDescription"

  maxStacks: 1

  @createContextObject: (intensifyLevel) ->
    contextObject = super()
    contextObject.intensifyLevel = intensifyLevel
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.intensify_counter_applied_desc",{intensify_effect_level: modifierContextObject.intensifyLevel})

module.exports = ModifierCounterIntensifyDescription
