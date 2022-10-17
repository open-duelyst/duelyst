Quest = require './quest'
GameStatus = require 'app/sdk/gameStatus'
GameType = require 'app/sdk/gameType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
CosmeticsChestTypeLookup = require 'app/sdk/cosmetics/cosmeticsChestTypeLookup'
QuestType = require './questTypeLookup'
i18next = require 'i18next'
moment = require 'moment'

class QuestSeasonal2018February extends Quest

  @Identifier: 30007 # ID to use for this quest
  isReplaceable: false # whether a player can replace this quest
  cosmeticKeys: [CosmeticsChestTypeLookup.Rare]
  rewardDetails: "1 Rare Crate Key."

  constructor:()->
    super(QuestSeasonal2018February.Identifier,i18next.t("quests.monthly_quest_title"),[QuestType.Seasonal])
    @params["completionProgress"] = 15

  progressForQuestCompletion:()->
    return 1

  getDescription:()->
    return i18next.t("quests.monthly_quest_desc",{count:@params["completionProgress"]})

  isAvailableOn:(momentUtc)->
    return momentUtc.isAfter(moment.utc("2018-01-30")) and momentUtc.isBefore(moment.utc("2018-03-01"))

module.exports = QuestSeasonal2018February
