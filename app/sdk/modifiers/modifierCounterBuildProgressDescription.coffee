Modifier = require './modifier'

i18next = require('i18next')

class ModifierCounterBuildProgressDescription extends Modifier

  type:"ModifierCounterBuildProgressDescription"
  @type:"ModifierCounterBuildProgressDescription"

  maxStacks: 1

  @createContextObject: (turnsLeft) ->
    contextObject = super()
    contextObject.turnsLeft = turnsLeft
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.building_counter_applied_desc",{turns_until_complete: modifierContextObject.turnsLeft})

module.exports = ModifierCounterBuildProgressDescription
