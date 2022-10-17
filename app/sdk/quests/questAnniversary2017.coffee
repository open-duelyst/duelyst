Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
QuestType = require './questTypeLookup'
moment = require 'moment'

class QuestAnniversary2017 extends Quest

  @Identifier: 40001 # ID to use for this quest
  isReplaceable: false # whether a player can replace this quest
  giftChests: [GiftCrateLookup.Anniversary2017]
  rewardDetails: "Gift Box contains: Some sweet rewards!"

  constructor:()->
    super(QuestAnniversary2017.Identifier,"Anniversary",[QuestType.Promotional])
    @params["completionProgress"] = 1
    @riftMatchesCount = true

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and player.isWinner and gameData.gameType == GameType.Rift
        return 1
    return 0

  getDescription:()->
    return "Win #{@params["completionProgress"]} Rift Match.<br>Expires May 12th UTC"

  isAvailableOn:(momentUtc)->
    return momentUtc.isAfter(moment.utc("2017-04-25")) and momentUtc.isBefore(moment.utc("2017-05-13"))

  expiresOn: ()->
    return moment.utc("2017-05-12")

module.exports = QuestAnniversary2017
