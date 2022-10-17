Achievement = require 'app/sdk/achievements/achievement'
CardsLookup = require 'app/sdk/cards/cardsLookup'
i18next = require('i18next')

class ShopAchievement extends Achievement
  @id: "silver_special_purchased"
  @title: i18next.t("achievements.silver_starter_bundle_title")
  @description: i18next.t("achievements.silver_starter_bundle_desc")
  @progressRequired: 1
  @rewards:
    cards: [
      {
        "rarity":3,
        "count":3,
        "cardSet":1,
        "sample": [
          CardsLookup.Neutral.TwilightMage,
          CardsLookup.Neutral.VenomToth,
          CardsLookup.Neutral.Purgatos,
          CardsLookup.Neutral.SwornAvenger,
          CardsLookup.Neutral.Dilotas,
          CardsLookup.Neutral.AlcuinLoremaster
        ],
        "factionId":[100]
      }
    ]
  @enabled: true

  @progressForArmoryTransaction: (armoryTransactionSku) ->
    if armoryTransactionSku.indexOf("SILVER_DIVISION_STARTER_SPECIAL") != -1
      return 1
    else
      return 0

module.exports = ShopAchievement
