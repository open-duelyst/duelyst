Achievement = require 'app/sdk/achievements/achievement'
QuestFactory = require 'app/sdk/quests/questFactory'
i18next = require('i18next')

class JourneymanQuestorAchievement extends Achievement
  @id: "journeymanQuestor"
  @title: i18next.t("achievements.journeyman_questor_title")
  @description: i18next.t("achievements.journeyman_questor_desc")
  @progressRequired: 1
  @rewards:
    neutralEpicCard: 1

  @progressForCompletingQuestId: (questId) ->
    sdkQuest = QuestFactory.questForIdentifier(questId)
    if (sdkQuest? and !sdkQuest.isBeginner)
      return 1
    else
      return 0

module.exports = JourneymanQuestorAchievement
