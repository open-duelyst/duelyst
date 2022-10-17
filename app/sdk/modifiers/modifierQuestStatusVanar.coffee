ModifierQuestStatus = require './modifierQuestStatus'

i18next = require('i18next')

class ModifierQuestStatusVanar extends ModifierQuestStatus

  type:"ModifierQuestStatusVanar"
  @type:"ModifierQuestStatusVanar"

  @createContextObject: (questCompleted, numTokensFound) ->
    contextObject = super()
    contextObject.questCompleted = questCompleted
    contextObject.numTokensFound = numTokensFound
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.questCompleted
        return i18next.t("modifiers.quest_completed_applied_desc")
      else
        return i18next.t("modifiers.vanarquest_counter_applied_desc",{token_count: modifierContextObject.numTokensFound})

  @getName: (modifierContextObject) ->
    return i18next.t("modifiers.vanarquest_counter_applied_name")

module.exports = ModifierQuestStatusVanar
