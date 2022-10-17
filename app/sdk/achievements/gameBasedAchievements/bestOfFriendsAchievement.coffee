Achievement = require 'app/sdk/achievements/achievement'
GameType = require 'app/sdk/gameType'
i18next = require('i18next')

# Play your first game with a Friend.

class BestOfFriendsAchievement extends Achievement
  @id: "bestOfFriends"
  @title: i18next.t("achievements.best_of_friends_title")
  @description: i18next.t("achievements.best_of_friends_desc")
  @progressRequired: 1
  @rewards:
    spiritOrb: 1

  @progressForGameDataForPlayerId: (gameData,playerId,isUnscored,isDraw) ->
    if gameData.gameType == GameType.Friendly
      return 1
    else
      return 0

module.exports = BestOfFriendsAchievement
