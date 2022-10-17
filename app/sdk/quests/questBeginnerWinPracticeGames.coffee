QuestBeginner = require './questBeginner'
QuestType = require './questTypeLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
Logger = require 'app/common/logger'
i18next = require 'i18next'

class QuestBeginnerWinPracticeGames extends QuestBeginner
  @Identifier: 9901
  spiritOrbsReward: 1
  goldReward: null # Awards a Spirit Orb instead of Gold. Adding gold messes up the UI.

  constructor:()->
    super(QuestBeginnerWinPracticeGames.Identifier,i18next.t("quests.quest_beginner_win_practice_games_title",{count:1}),[QuestType.Beginner],@.goldReward)
    @params["completionProgress"] = 1

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      Logger.module("Quests").debug "QuestBeginnerWinPracticeGames checking #{player.playerId} game type #{gameData.gameType} winner: #{player.isWinner}"
      if player.playerId == playerId and player.isWinner and gameData.gameType == GameType.SinglePlayer
        return 1
    return 0

  getDescription:()->
    return i18next.t("quests.quest_beginner_win_practice_games_description",{count:@params["completionProgress"]})

module.exports = QuestBeginnerWinPracticeGames
