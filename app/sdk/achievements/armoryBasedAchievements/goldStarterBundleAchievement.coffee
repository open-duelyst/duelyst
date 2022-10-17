Achievement = require 'app/sdk/achievements/achievement'
i18next = require('i18next')

class ShopAchievement extends Achievement
  @id: "gold_special_purchased"
  @title: i18next.t("achievements.gold_starter_bundle_title")
  @description: i18next.t("achievements.gold_starter_bundle_desc")
  @progressRequired: 1
  @rewards:
    cards: [
      {
        "rarity":4,
        "count":3,
        "cardSet":1,
        "factionId":[1,2,3,4,5,6]
      }
    ]
  @enabled: true

  @progressForArmoryTransaction: (armoryTransactionSku) ->
    if armoryTransactionSku.indexOf("GOLD_DIVISION_STARTER_SPECIAL") != -1
      return 1
    else
      return 0

module.exports = ShopAchievement
