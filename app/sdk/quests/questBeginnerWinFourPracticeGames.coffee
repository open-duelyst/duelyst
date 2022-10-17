QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
Logger = require 'app/common/logger'

class QuestBeginnerWinFourPracticeGames extends QuestBeginner
  @Identifier: 9905

  constructor:()->
    super(QuestBeginnerWinFourPracticeGames.Identifier,"Win 4 Practice Games",[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 4

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      Logger.module("Quests").debug "QuestBeginnerWinFourPracticeGames checking #{player.playerId} game type #{playerSetupData.gameType} winner: #{player.isWinner}"
      if player.playerId == playerId and player.isWinner and gameData.gameType == GameType.SinglePlayer
        return 1
    return 0

  getDescription:()->
    return "Win #{@params["completionProgress"]} game in practice mode."

module.exports = QuestBeginnerWinFourPracticeGames
