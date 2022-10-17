i18next = require('i18next')

Achievement = require 'app/sdk/achievements/achievement'
GameType = require 'app/sdk/gameType'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'

# Play your first 20 Season Ranked games.

class WartechGeneralFaction1Achievement extends Achievement
  @id: "wartechGeneralFaction1Achievement"
  @title: i18next.t("achievements.wartech_general_achievement_title",{faction_name:i18next.t("factions.faction_1_abbreviated_name")})
  @description: i18next.t("achievements.wartech_general_achievement_desc",{faction_name:i18next.t("factions.faction_1_abbreviated_name")})
  @progressRequired: 10
  @rewards:
    cards: [
      Cards.Faction1.ThirdGeneral
    ]
  @tracksProgress: true

  @progressForGameDataForPlayerId: (gameData,playerId,isUnscored,isDraw) ->
    if !GameType.isCompetitiveGameType(gameData.gameType)
      return 0

    if isUnscored
      return 0

    playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, playerId)
    playerFactionId = playerSetupData.factionId
    if playerFactionId != Factions.Faction1
      return 0

    if UtilsGameSession.getWinningPlayerId(gameData) != playerId
      return 0

    # If the above all are passed 1 progress made
    return 1

  @progressForArmoryTransaction: (armoryTransactionSku) ->
    if armoryTransactionSku.indexOf("WARTECH_PREORDER_35") != -1
      return 10
    else
      return 0

  @rewardUnlockMessage: (progressMade)->
    if not progressMade?
      progressMade = 0

    progressNeeded =   Math.max(@progressRequired - progressMade,0)

    return "Win #{progressNeeded} more online matches with Lyonar to unlock."

module.exports = WartechGeneralFaction1Achievement
