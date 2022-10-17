QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'

class QuestBeginnerWinThreeRankedMatches extends QuestBeginner
  @Identifier: 9907

  constructor:()->
    super(QuestBeginnerWinThreeRankedMatches.Identifier,"Rank up",[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 3

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      # TODO: ensure this allows a player who is ranked playing vs a casual to progress (looks like it should)
      if player.playerId == playerId and player.isWinner and gameData.gameType == GameType.Ranked
        return 1
    return 0

  getDescription:()->
    return "Win #{@params["completionProgress"]} Ranked Games."

module.exports = QuestBeginnerWinThreeRankedMatches
