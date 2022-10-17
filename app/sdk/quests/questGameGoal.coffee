Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'

###
  QuestGameGoal - creates a quest that makes progress through a goalTester
###

class QuestGameGoal extends Quest
  description: undefined # user visible description of quest
  # goalTester format : (gameSessionData,playerIdString) -> return questProgress
  goalTester: undefined # see format above

  # numGamesRequiredToSatisfyQuest - how many times the goal must be met to award quest gold
  constructor:(id, name, typesIn, reward, numGamesRequiredToSatisfyQuest, description, goalTester)->
    super(id,name,typesIn,reward)
    @params["completionProgress"] = numGamesRequiredToSatisfyQuest
    @description = description
    @goalTester = goalTester

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and GameType.isCompetitiveGameType(gameData.gameType)
        return @goalTester(gameData,playerId)
    return 0

  getDescription:()->
    return @description

module.exports = QuestGameGoal
