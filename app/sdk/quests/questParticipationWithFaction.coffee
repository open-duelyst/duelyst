Quest = require './quest'
UtilsGameSession = require 'app/common/utils/utils_game_session'
GameType = require 'app/sdk/gameType'
FactionsLookup = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
i18next = require 'i18next'

class QuestParticipationWithFaction extends Quest

  factionId:null

  constructor:(id,typesIn,reward,@factionId)->
    faction = FactionFactory.factionForIdentifier(@.factionId)
    name = i18next.t("quests.quest_faction_games_title", { faction_name: faction.short_name })
    super(id,name,typesIn,reward)
    @params["factionId"] = @factionId
    @params["completionProgress"] = 4

  _progressForGameDataForPlayerId:(gameData,playerId)->
    for player in gameData.players
      playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData, player.playerId)
      if player.playerId == playerId and playerSetupData.factionId == this.getFactionId() and GameType.isCompetitiveGameType(gameData.gameType)
        return 1
    return 0

  getFactionId:()=>
    @factionId

  getDescription:()->
    faction = FactionFactory.factionForIdentifier(@.factionId)
    if @.getFactionId() == FactionsLookup.Abyssian
      #TODO: Localization issue?
      #return "Play #{@params["completionProgress"]} online games with an #{@factionName} Deck."
      return i18next.t("quests.quest_faction_abyss_games_desc",{count:@params["completionProgress"],faction:faction.short_name})
    else
      return i18next.t("quests.quest_faction_games_desc",{count:@params["completionProgress"],faction:faction.short_name})
      #return "Play #{@params["completionProgress"]} online games with a #{@factionName} Deck."

module.exports = QuestParticipationWithFaction
