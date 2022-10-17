QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'

class QuestBeginnerWinThreeQuickMatches extends QuestBeginner
  @Identifier: 9908
  isRequired: false

  # TODO: needs to unlock codex somehow
  constructor:()->
    super(QuestBeginnerWinThreeQuickMatches.Identifier,"Lore master",[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 3

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and player.isWinner and gameData.gameType == GameType.Casual
        return 1
    return 0

  getDescription:()->
    return "Win #{@params["completionProgress"]} games in Quick Match."

module.exports = QuestBeginnerWinThreeQuickMatches
