Achievement = require 'app/sdk/achievements/achievement'
GameType = require 'app/sdk/gameType'
CosmeticsLookup = require 'app/sdk/cosmetics/cosmeticsLookup'
CosmeticsTypeLookup = require 'app/sdk/cosmetics/cosmeticsTypeLookup'
_ = require 'underscore'

class HomeTurfAchievement extends Achievement
  @id: "homeTurf"
  @title: "Home Turf"
  @description: "You've won 5 games as Player One. Enjoy a free Premium Battle Map on us!"
  @progressRequired: 5
  @enabled: false
  @rewards:
    newRandomCosmetics: [
      { type: CosmeticsTypeLookup.BattleMap }
    ]

  @progressForGameDataForPlayerId: (gameData,playerId,isUnscored,isDraw) ->
    if isUnscored || !GameType.isFactionXPGameType(gameData.gameType)
      return 0

    if gameData.players[0].playerId == playerId and gameData.players[0].isWinner
      return 1

    return 0

module.exports = HomeTurfAchievement
