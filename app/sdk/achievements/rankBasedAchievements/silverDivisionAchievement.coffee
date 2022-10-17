Achievement = require 'app/sdk/achievements/achievement'
i18next = require('i18next')

class SilverDivisionAchievement extends Achievement
  @id: "silverDivisionAchievement"
  @title: i18next.t("achievements.silver_division_title")
  @description: i18next.t("achievements.silver_division_desc")
  @progressRequired: 1
  @rewards:
    spiritOrb: 1
  @enabled: false

  @progressForAchievingRank: (rank) ->
    if rank <= 20
      return 1
    else
      return 0

module.exports = SilverDivisionAchievement
