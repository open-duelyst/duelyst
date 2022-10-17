Quest = require './quest'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
i18next = require 'i18next'

class QuestCatchUp extends Quest

  @Identifier: 20000 # ID to use for this quest

  isReplaceable:false # whether a player can replace this quest
  isCatchUp:true # defines this as a catchup quest
  goldReward: undefined # This is a changing quantity updated to the database when users gain charges

  constructor:()->
    super(QuestCatchUp.Identifier,i18next.t("quests.quest_welcome_back_title"),[QuestType.CatchUp])
    @params["completionProgress"] = 3

  _progressForGameDataForPlayerId:(gameData,playerId)->
    # Gain progress for any games played
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and GameType.isCompetitiveGameType(gameData.gameType)
        return 1
    return 0

  getDescription:()->
    return i18next.t("quests.quest_welcome_back_desc",{count:@params["completionProgress"]})
    #return "Play #{@params["completionProgress"]} Games."

module.exports = QuestCatchUp
