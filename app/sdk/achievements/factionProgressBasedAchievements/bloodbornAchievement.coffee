Achievement = require 'app/sdk/achievements/achievement'
i18next = require('i18next')

class BloodbornAchievement extends Achievement
  @id: "bloodborn"
  @title: i18next.t("achievements.bloodborn_title")
  @description: i18next.t("achievements.bloodborn_desc")
  @progressRequired: 1
  @rewards:
    spiritOrb: 1
  @enabled: false


  # returns progress made by reaching a state of faction progression
  @progressForFactionProgression: (factionProgressionData) ->
    # 9 is the faction level at which players have unlocked all cards for a faction
    for factionId,factionData of factionProgressionData
      if factionData and factionData.stats and factionData.stats.level == 9
        return 1

    # No factions are level 9 so no progress is made
    return 0


module.exports = BloodbornAchievement
