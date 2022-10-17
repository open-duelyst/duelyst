Achievement = require 'app/sdk/achievements/achievement'
i18next = require('i18next')

# Disenchant your first Card.

class WelcomeToCraftingAchievement extends Achievement
  @id: "welcomeToCrafting"
  @title: i18next.t("achievements.welcome_to_crafting_title")
  @description: i18next.t("achievements.welcome_to_crafting_desc")
  @progressRequired: 1
  @rewards:
    spirit: 90
  @enabled: false

  @progressForDisenchanting: (cardId) ->
    return 1


module.exports = WelcomeToCraftingAchievement
