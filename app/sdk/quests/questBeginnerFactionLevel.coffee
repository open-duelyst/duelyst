QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
i18next = require 'i18next'

class QuestBeginnerFactionLevel extends QuestBeginner
  @Identifier: 9906

  constructor:()->
    super(QuestBeginnerFactionLevel.Identifier,i18next.t("quests.quest_beginner_faction_up_title"),[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 1

  progressForProgressedFactionData: (progressedFactionData)->
    if progressedFactionData and progressedFactionData.level >= 9
      return 1
    else
      return 0

  getDescription:()->
    return i18next.t("quests.quest_beginner_faction_up_desc")

#  progressForChallengeId:()->
#    return 1

module.exports = QuestBeginnerFactionLevel
