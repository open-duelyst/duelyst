ModifierQuestStatus = require './modifierQuestStatus'
i18next = require('i18next')

class ModifierQuestStatusLyonar extends ModifierQuestStatus

  type:"ModifierQuestStatusLyonar"
  @type:"ModifierQuestStatusLyonar"

  @createContextObject: (questCompleted, numMinionsSummoned) ->
    contextObject = super()
    contextObject.questCompleted = questCompleted
    contextObject.numMinionsSummoned = numMinionsSummoned
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.questCompleted
        return i18next.t("modifiers.quest_completed_applied_desc")
      else
        return i18next.t("modifiers.lyonarquest_counter_applied_desc",{summon_count: modifierContextObject.numMinionsSummoned})

  @getName: (modifierContextObject) ->
    return i18next.t("modifiers.lyonarquest_counter_applied_name")

module.exports = ModifierQuestStatusLyonar
