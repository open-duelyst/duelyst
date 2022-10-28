class GameType
  @Ranked: "ranked"
  @Casual: "casual"
  @Gauntlet: "gauntlet"
  @Friendly: "friendly" # Friend Challenge
  @Challenge: "challenge" # Solo Challenge
  @Sandbox: "sandbox"
  @SinglePlayer: "single_player"
  @Rift: "rift"
  @BossBattle: "boss_battle"
  @FriendlyLegacy: "friendly_legacy"

  GameFormat = require './gameFormat'

  @isNetworkGameType: (type) ->
    return type == GameType.Ranked or type == GameType.Casual or type == GameType.Gauntlet or type == GameType.Friendly or type == GameType.SinglePlayer or type == GameType.BossBattle or type == GameType.Rift or type == GameType.FriendlyLegacy

  @isMultiplayerGameType: (type) ->
    return type == GameType.Ranked or type == GameType.Casual or type == GameType.Gauntlet or type == GameType.Friendly or type == GameType.Rift or type == GameType.FriendlyLegacy

  @isSinglePlayerGameType: (type) ->
    return type == GameType.SinglePlayer or type == GameType.BossBattle or type == GameType.Challenge or type == GameType.Sandbox

  @isLocalGameType: (type) ->
    return type == GameType.Challenge or type == GameType.Sandbox

  @isCompetitiveGameType: (type) ->
    return type == GameType.Ranked or type == GameType.Casual or type == GameType.Gauntlet or type == GameType.Rift

  @isFactionXPGameType: (type) ->
    return type == GameType.Ranked or type == GameType.Casual or type == GameType.Gauntlet or type == GameType.SinglePlayer or type == GameType.Friendly or type == GameType.BossBattle or type == GameType.Rift or type == GameType.FriendlyLegacy

  @getGameFormatForGameType: (type) ->
    return GameFormat.Legacy

module.exports = GameType
