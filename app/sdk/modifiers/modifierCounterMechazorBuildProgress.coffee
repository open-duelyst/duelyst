ModifierCounter = require './modifierCounter'
ModifierCounterMechazorBuildProgressDescription = require './modifierCounterMechazorBuildProgressDescription'

i18next = require('i18next')

###
  Counts current progress towards mechaz0r build
###
class ModifierCounterMechazorBuildProgress extends ModifierCounter

  type:"ModifierCounterMechazorBuildProgress"
  @type:"ModifierCounterMechazorBuildProgress"

  maxStacks: 1

  @createContextObject: (mechazorProgressType, mechazorsBuiltType) ->
    contextObject = super()
    contextObject.mechazorProgressType = mechazorProgressType
    contextObject.mechazorsBuiltType = mechazorsBuiltType
    return contextObject

  getModifierContextObjectToApply: () ->
    modContextObject = ModifierCounterMechazorBuildProgressDescription.createContextObject(@getCurrentCount())
    modContextObject.appliedName = i18next.t("modifiers.mechazor_counter_applied_name")

    return modContextObject

  getCurrentCount: () ->
    modifierMechazorProgress = @getGameSession().getModifierClassForType(@mechazorProgressType)
    modifierMechazorsSummoned = @getGameSession().getModifierClassForType(@mechazorsBuiltType)

    mechazorProgressMods = @getCard().getActiveModifiersByClass(modifierMechazorProgress)
    numMechazorsSummoned = @getCard().getActiveModifiersByClass(modifierMechazorsSummoned).length
    mechazorProgress = 0
    for mod in mechazorProgressMods
      mechazorProgress += mod.getProgressContribution()
    return (mechazorProgress - (numMechazorsSummoned * 5)) * 20


module.exports = ModifierCounterMechazorBuildProgress
