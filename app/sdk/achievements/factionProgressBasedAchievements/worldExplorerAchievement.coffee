Achievement = require 'app/sdk/achievements/achievement'
FactionFactory = require 'app/sdk/cards/factionFactory'
_ = require 'underscore'
i18next = require('i18next')

class WorldExplorerAchievement extends Achievement
  @id: "worldExplorer"
  @title: i18next.t("achievements.world_explorer_title")
  @description: i18next.t("achievements.world_explorer_desc")
  @progressRequired: 1
  @rewards:
    factionLegendaryCard: 1


  # returns progress made by reaching a state of faction progression
  @progressForFactionProgression: (factionProgressionData) ->
    # Check all factions for having at least 1 match played
    playableFactions = FactionFactory.getAllPlayableFactions()
    playableFactionIds = _.map(playableFactions, (faction) -> return faction.id)
    for playableFactionId in playableFactionIds
      factionData = factionProgressionData[playableFactionId]
      factionGameCount = factionData?.stats?.game_count || 0
      # If player has no game count or a 0 game count for any playable faction: return with no progress
      if factionGameCount == 0
        # No games for this faction yet means no progress
        return 0

    # If all playable factions have at least 1 game played, return 1 progress which completes the achievement
    return 1


module.exports = WorldExplorerAchievement
