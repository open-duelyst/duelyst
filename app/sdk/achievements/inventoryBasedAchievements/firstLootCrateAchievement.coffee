Achievement = require 'app/sdk/achievements/achievement'
CardFactory = require 'app/sdk/cards/cardFactory'
Factions = require 'app/sdk/cards/factionsLookup'
GameSession = require 'app/sdk/gameSession'
RarityLookup = require 'app/sdk/cards/rarityLookup'
CosmeticsChestTypeLookup = require 'app/sdk/cosmetics/cosmeticsChestTypeLookup'
i18next = require('i18next')

_ = require 'underscore'

class FirstCosmeticChestAchievement extends Achievement
  @id: "firstCosmeticChestAchievement"
  @title: i18next.t("achievements.key_mythron_title")
  @description: i18next.t("achievements.key_mythron_desc")
  @progressRequired: 1
  @rewards:
    bronzeCrateKey: 1


  # returns progress made by receiving a loot crate
  @progressForReceivingCosmeticChest: (cosmeticChestType) ->
    if (cosmeticChestType == CosmeticsChestTypeLookup.Common)
      return 1
    else
      return 0


module.exports = FirstCosmeticChestAchievement
