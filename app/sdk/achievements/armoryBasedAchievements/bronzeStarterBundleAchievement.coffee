Achievement = require 'app/sdk/achievements/achievement'
CardsLookup = require 'app/sdk/cards/cardsLookup'
i18next = require('i18next')

class ShopAchievement extends Achievement
  @id: "bronze_special_purchased"
  @title: i18next.t("achievements.bronze_starter_bundle_title")
  @description: i18next.t("achievements.bronze_starter_bundle_desc")
  @progressRequired: 1
  @rewards:
    cards: [
      {
        "rarity":4,
        "count":3,
        "cardSet":1,
        "sample": [
          CardsLookup.Neutral.Pandora,
          CardsLookup.Neutral.Spelljammer,
          CardsLookup.Neutral.ArchonSpellbinder,
          CardsLookup.Neutral.RedSynja,
          CardsLookup.Neutral.DarkNemesis,
          CardsLookup.Neutral.JaxTruesight
        ],
        "factionId":[100]
      }
    ]
  @enabled: true

  @progressForArmoryTransaction: (armoryTransactionSku) ->
    if armoryTransactionSku.indexOf("BRONZE_DIVISION_STARTER_SPECIAL") != -1
      return 1
    else
      return 0

module.exports = ShopAchievement
