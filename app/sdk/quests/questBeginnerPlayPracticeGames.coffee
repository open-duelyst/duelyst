QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
Logger = require 'app/common/logger'

class QuestBeginnerPlayPracticeGames extends QuestBeginner
  @Identifier: 9902

  constructor:()->
    super(QuestBeginnerPlayPracticeGames.Identifier,"Play 3 Practice Games",[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 3

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and gameData.gameType == GameType.SinglePlayer
        return 1
    return 0

  getDescription:()->
    return "Play #{@params["completionProgress"]} games in practice mode."

module.exports = QuestBeginnerPlayPracticeGames
