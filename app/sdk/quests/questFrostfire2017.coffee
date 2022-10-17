Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
QuestType = require './questTypeLookup'
moment = require 'moment'

class QuestFrostfire2017 extends Quest

  @Identifier: 40002 # ID to use for this quest
  isReplaceable: false # whether a player can replace this quest
  giftChests: [GiftCrateLookup.FrostfirePurchasable2017]
  rewardDetails: "Holiday Loot Crate"

  constructor:()->
    super(QuestFrostfire2017.Identifier,"Frostfire Loot Crate",[QuestType.Promotional])
    @params["completionProgress"] = 15

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if gameData.gameType == GameType.Casual
        return 1
    return 0

  getDescription:()->
    return "Play #{@params["completionProgress"]} Frostfire Mode matches before Jan 4th UTC"

  isAvailableOn:(momentUtc)->
    return momentUtc.isAfter(moment.utc("2017-12-05")) and momentUtc.isBefore(moment.utc("2018-01-05"))

  expiresOn: ()->
    return moment.utc("2018-01-04")

module.exports = QuestFrostfire2017
