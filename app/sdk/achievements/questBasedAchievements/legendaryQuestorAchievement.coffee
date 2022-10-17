Achievement = require 'app/sdk/achievements/achievement'
QuestFactory = require 'app/sdk/quests/questFactory'
i18next = require('i18next')

class LegendaryQuestorAchievement extends Achievement
  @id: "legendaryQuestor"
  @title: i18next.t("achievements.legendary_questor_title")
  @description: i18next.t("achievements.legendary_questor_desc")
  @progressRequired: 13
  @rewards:
    neutralLegendaryCard: 1

  @progressForCompletingQuestId: (questId) ->
    sdkQuest = QuestFactory.questForIdentifier(questId)
    if (sdkQuest? and !sdkQuest.isBeginner)
      return 1
    else
      return 0

module.exports = LegendaryQuestorAchievement
