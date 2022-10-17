Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
QuestType = require './questTypeLookup'
moment = require 'moment'

class QuestLegacyLaunch extends Quest

  @Identifier: 40003 # ID to use for this quest
  isReplaceable: false # whether a player can replace this quest
  giftChests: [GiftCrateLookup.LegacyLaunch]
  rewardDetails: "Unlimited Mode Celebration Crate"

  constructor:()->
    super(QuestLegacyLaunch.Identifier,"Unlimited Celebration",[QuestType.Promotional])
    @params["completionProgress"] = 7

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if gameData.gameType == GameType.Casual
        return 1
    return 0

  getDescription:()->
    return "Play #{@params["completionProgress"]} Unlimited Mode matches before April 30th UTC"

  isAvailableOn:(momentUtc)->
    return momentUtc.isAfter(moment.utc("2018-03-14")) and momentUtc.isBefore(moment.utc("2018-04-30"))

  expiresOn: ()->
    return moment.utc("2018-03-14")

module.exports = QuestLegacyLaunch
