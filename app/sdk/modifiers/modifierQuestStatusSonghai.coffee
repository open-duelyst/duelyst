ModifierQuestStatus = require './modifierQuestStatus'
_ = require 'underscore'

i18next = require('i18next')

class ModifierQuestStatusSonghai extends ModifierQuestStatus

  type:"ModifierQuestStatusSonghai"
  @type:"ModifierQuestStatusSonghai"

  @createContextObject: (questCompleted, minionCostsSummoned) ->
    contextObject = super()
    contextObject.questCompleted = questCompleted
    contextObject.minionCostsSummoned = minionCostsSummoned
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.questCompleted
        return i18next.t("modifiers.quest_completed_applied_desc")
      else
        sortedCosts = _.sortBy(modifierContextObject.minionCostsSummoned, (num) -> num)
        costsSummoned = ""
        for cost in sortedCosts
          if costsSummoned != ""
            costsSummoned = costsSummoned + ","
          costsSummoned = costsSummoned + cost
        return i18next.t("modifiers.songhaiquest_counter_applied_desc",{summon_count: modifierContextObject.minionCostsSummoned.length, manacost_list: costsSummoned})

  @getName: (modifierContextObject) ->
    return i18next.t("modifiers.songhaiquest_counter_applied_name")

module.exports = ModifierQuestStatusSonghai
