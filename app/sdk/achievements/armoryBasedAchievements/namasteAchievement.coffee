Achievement = require 'app/sdk/achievements/achievement'
i18next = require('i18next')

# Make your first real-money purchase at the THE ARMORY.

class NamasteAchievement extends Achievement
  @id: "namaste"
  @title: i18next.t("achievements.namaste_title")
  @description: i18next.t("achievements.namaste_desc")
  @progressRequired: 1
  @rewards:
    gold: 100 # TODO: will be snowchaser
  @enabled: false


  @progressForArmoryTransaction: (armoryTransactionSku) ->
    if armoryTransactionSku.indexOf("BOOSTER") != -1
      return 1
    else
      return 0


module.exports = NamasteAchievement
