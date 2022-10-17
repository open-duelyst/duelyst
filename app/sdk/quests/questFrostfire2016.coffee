Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
QuestType = require './questTypeLookup'
moment = require 'moment'

class QuestFrostfire2016 extends Quest

  @Identifier: 30001 # ID to use for this quest
  isReplaceable: false # whether a player can replace this quest
  giftChests: [GiftCrateLookup.Frostfire2016]
  rewardDetails: "Gift Box contains: Saberspine Tiger Skin, 100 Gold, 1 Rare Crate Key."

  constructor:()->
    super(QuestFrostfire2016.Identifier,"Frostfire",[QuestType.Seasonal])
    @params["completionProgress"] = 15

  progressForQuestCompletion:()->
    return 1

  getDescription:()->
    return "Complete #{@params["completionProgress"]} quests."

  isAvailableOn:(momentUtc)->
    return momentUtc.isAfter(moment.utc("2016-12-01")) and momentUtc.isBefore(moment.utc("2017-01-01"))

module.exports = QuestFrostfire2016
