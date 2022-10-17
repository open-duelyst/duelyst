Achievement = require 'app/sdk/achievements/achievement'
QuestFactory = require 'app/sdk/quests/questFactory'
i18next = require('i18next')

class IndomitableSpiritAchievement extends Achievement
  @id: "indominatableSpirit"
  @title: i18next.t("achievements.indomitable_spirit_title")
  @description: i18next.t("achievements.indomitable_spirit_desc")
  @progressRequired: 100
  @rewards:
    gold: 100

  @progressForCompletingQuestId: (questId) ->
    sdkQuest = QuestFactory.questForIdentifier(questId)
    if (sdkQuest? and !sdkQuest.isBeginner)
      return 1
    else
      return 0

module.exports = IndomitableSpiritAchievement
