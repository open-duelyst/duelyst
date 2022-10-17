Quest = require './quest'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'

class QuestWinWithFaction extends Quest

  factionId:null
  factionName:null

  constructor:(id,name,typesIn,reward,@factionId,@factionName)->
    super(id,name,typesIn,reward)
    @params["factionId"] = @factionId
    @params["completionProgress"] = 2

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and player.isWinner and playerSetupData.factionId == this.getFactionId() and GameType.isCompetitiveGameType(gameData.gameType)
        return 1
    return 0

  getFactionId:()->
    @factionId

  getDescription:()->
    return "Win #{@params["completionProgress"]} games with a #{@factionName} Deck."

module.exports = QuestWinWithFaction
