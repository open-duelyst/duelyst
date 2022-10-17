ModifierQuestStatus = require './modifierQuestStatus'
i18next = require('i18next')

class ModifierQuestStatusAbyssian extends ModifierQuestStatus

  type:"ModifierQuestStatusAbyssian"
  @type:"ModifierQuestStatusAbyssian"

  @createContextObject: (questCompleted, deathSpellActionCount) ->
    contextObject = super()
    contextObject.questCompleted = questCompleted
    contextObject.deathSpellActionCount = deathSpellActionCount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.questCompleted
        return i18next.t("modifiers.quest_completed_applied_desc")
      else
        return i18next.t("modifiers.abyssianquest_counter_applied_desc",{spell_count: modifierContextObject.deathSpellActionCount})

  @getName: (modifierContextObject) ->
    return i18next.t("modifiers.abyssianquest_counter_applied_name")

module.exports = ModifierQuestStatusAbyssian
