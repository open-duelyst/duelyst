Achievement = require 'app/sdk/achievements/achievement'
QuestFactory = require 'app/sdk/quests/questFactory'
i18next = require('i18next')

class EpicQuestorAchievement extends Achievement
  @id: "epicQuestor"
  @title: i18next.t("achievements.epic_questor_title")
  @description: i18next.t("achievements.epic_questor_desc")
  @progressRequired: 5
  @rewards:
    neutralEpicCard: 1

  @progressForCompletingQuestId: (questId) ->
    sdkQuest = QuestFactory.questForIdentifier(questId)
    if (sdkQuest? and !sdkQuest.isBeginner)
      return 1
    else
      return 0

module.exports = EpicQuestorAchievement
