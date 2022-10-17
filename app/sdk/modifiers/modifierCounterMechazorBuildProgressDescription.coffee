Modifier = require './modifier'

i18next = require('i18next')

class ModifierCounterMechazorBuildProgressDescription extends Modifier

  type:"ModifierCounterMechazorBuildProgressDescription"
  @type:"ModifierCounterMechazorBuildProgressDescription"

  maxStacks: 1

  @createContextObject: (percentComplete) ->
    contextObject = super()
    contextObject.percentComplete = percentComplete
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.mechazor_counter_applied_desc",{percent_complete: modifierContextObject.percentComplete})

module.exports = ModifierCounterMechazorBuildProgressDescription
