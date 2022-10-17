Achievement = require 'app/sdk/achievements/achievement'
GameType = require 'app/sdk/gameType'
i18next = require('i18next')

# Play your first 20 Season Ranked games.

class EnteringGauntletAchievement extends Achievement
  @id: "enteringGauntletAchievement"
  @title: i18next.t("achievements.entering_gauntlet_title")
  @description: i18next.t("achievements.entering_gauntlet_desc")
  @progressRequired: 20
  @rewards:
    gauntletTicket: 1

  @progressForGameDataForPlayerId: (gameData,playerId,isUnscored,isDraw) ->
    if gameData.gameType == GameType.Ranked && !isUnscored
      return 1
    else
      return 0

module.exports = EnteringGauntletAchievement
