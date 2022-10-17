Achievement = require 'app/sdk/achievements/achievement'
GameType = require 'app/sdk/gameType'
i18next = require('i18next')

# Given when a player loses 3 games

class HelpingHandAchievement extends Achievement
  @id: "helpingHand"
  @title: i18next.t("achievements.helping_hand_title")
  @description: i18next.t("achievements.helping_hand_desc")
  @progressRequired: 10
  @rewards:
    gold: 100

  @progressForGameDataForPlayerId: (gameData,playerId,isUnscored,isDraw) ->
    if isUnscored || !GameType.isFactionXPGameType(gameData.gameType)
      return 0

    for player in gameData.players
      if player.playerId == playerId
        return 1

    return 0

module.exports = HelpingHandAchievement
