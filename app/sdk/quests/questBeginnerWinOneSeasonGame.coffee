QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
i18next = require 'i18next'

class QuestBeginnerWinOneSeasonGame extends QuestBeginner
  @Identifier: 9910

  constructor:()->
    super(QuestBeginnerWinOneSeasonGame.Identifier,i18next.t("quests.quest_beginner_win_ladder_game_title"),[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 1

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and player.isWinner and (gameData.gameType == GameType.Casual or gameData.gameType == GameType.Ranked)
        return 1
    return 0

  getDescription:()->
    return i18next.t("quests.quest_beginner_win_ladder_game_desc",{count:@params["completionProgress"]})
    #return "Win #{@params["completionProgress"]} Season Ladder Game."

module.exports = QuestBeginnerWinOneSeasonGame
