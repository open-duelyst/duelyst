Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
CosmeticsChestTypeLookup = require 'app/sdk/cosmetics/cosmeticsChestTypeLookup'
QuestType = require './questTypeLookup'
moment = require 'moment'

class QuestSeasonal2017October extends Quest

  @Identifier: 30006 # ID to use for this quest
  isReplaceable: false # whether a player can replace this quest
  cosmeticKeys: [CosmeticsChestTypeLookup.Common]
  rewardDetails: "1 Common Crate Key."

  constructor:()->
    super(QuestSeasonal2017October.Identifier,"Monthly Quest",[QuestType.Seasonal])
    @params["completionProgress"] = 15

  progressForQuestCompletion:()->
    return 1

  getDescription:()->
    return "Complete #{@params["completionProgress"]} quests."

  isAvailableOn:(momentUtc)->
    return momentUtc.isAfter(moment.utc("2017-10-01")) and momentUtc.isBefore(moment.utc("2017-11-01"))

module.exports = QuestSeasonal2017October
