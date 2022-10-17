Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class QuestAlternateDestroyUnits extends Quest

  constructor:(id,name,typesIn,reward)->
    super(id,name,typesIn,reward)
    @params["completionProgress"] = 2

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and GameType.isCompetitiveGameType(gameData.gameType)
        return player.totalMinionsKilled
    return 0

  getDescription:()->
    return "Destroy #{@params["completionProgress"]} enemy units."

module.exports = QuestAlternateDestroyUnits
