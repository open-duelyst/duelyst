QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
i18next = require 'i18next'

class QuestBeginnerCompleteSoloChallenges extends QuestBeginner
  @Identifier: 9904
  isRequired:false

  constructor:()->
    super(QuestBeginnerCompleteSoloChallenges.Identifier,i18next.t("quests.quest_beginner_complete_solo_challenges_title"),[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 3

  getDescription:()->
    return i18next.t("quests.quest_beginner_complete_solo_challenges_desc",{count:@params["completionProgress"]})
    #return "Complete #{@params["completionProgress"]} Solo Challenges."

  progressForChallengeId:()->
    return 1

module.exports = QuestBeginnerCompleteSoloChallenges
