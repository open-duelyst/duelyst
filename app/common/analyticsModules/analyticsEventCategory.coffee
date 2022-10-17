# Enum for the different types of Analytics Event Priority
# Lower numbers are lower priority, actual interger values are arbitrary


class AnalyticsEventCategory

  @Marketing: "marketing"
  @FTUE: "first time user experience"
  @Game: "game"
  @Quest: "quest"
  @Chat: "chat"
  @Matchmaking: "matchmaking"
  @SpiritOrbs: "spirit orbs"
  @Challenges: "challenges"
  @Shop: "shop"
  @Gauntlet: "gauntlet"
  @Watch: "watch"
  @Codex: "codex"
  @Crate: "crate"
  @Boss: "boss"
  @Rift: "rift"
  @Inventory: "inventory"
  @Debug: "debug"


module.exports = AnalyticsEventCategory
