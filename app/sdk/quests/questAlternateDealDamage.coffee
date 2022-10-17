Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class QuestAlternateDealDamage extends Quest

  constructor:(id,name,typesIn,reward)->
    super(id,name,typesIn,reward)
    @params["completionProgress"] = 40

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and GameType.isCompetitiveGameType(gameData.gameType)
        return player.totalDamageDealt
    return 0

  getDescription:()->
    return "Deal #{@params["completionProgress"]} damage to enemy units."

module.exports = QuestAlternateDealDamage
