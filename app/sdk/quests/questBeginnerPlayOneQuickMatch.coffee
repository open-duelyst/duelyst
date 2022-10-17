QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'

class QuestBeginnerPlayOneQuickMatch extends QuestBeginner
  @Identifier: 9903

  constructor:()->
    super(QuestBeginnerPlayOneQuickMatch.Identifier,"Into the Fray",[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 1

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and gameData.gameType == GameType.Casual
        return 1
    return 0

  getDescription:()->
    return "Play #{@params["completionProgress"]} Quick Match."

module.exports = QuestBeginnerPlayOneQuickMatch
