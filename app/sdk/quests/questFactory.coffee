Logger = require 'app/common/logger'

QuestType = require './questTypeLookup'
Quest = require './quest'
QuestWinWithFaction = require './questWinWithFaction'
QuestParticipationWithFaction = require './questParticipationWithFaction'
QuestAlternateDealDamage = require './questAlternateDealDamage'
QuestAlternateDestroyUnits = require './questAlternateDestroyUnits'
QuestGameGoal = require './questGameGoal'

# beginner quests
QuestBeginnerWinPracticeGames = require './questBeginnerWinPracticeGames'
QuestBeginnerPlayPracticeGames = require './questBeginnerPlayPracticeGames'
QuestBeginnerCompleteSoloChallenges = require './questBeginnerCompleteSoloChallenges'
QuestBeginnerFactionLevel = require './questBeginnerFactionLevel'
QuestBeginnerPlayOneQuickMatch = require './questBeginnerPlayOneQuickMatch'
QuestBeginnerWinFourPracticeGames = require './questBeginnerWinFourPracticeGames'
QuestBeginnerWinThreeQuickMatches = require './questBeginnerWinThreeQuickMatches'
QuestBeginnerWinThreeRankedMatches = require './questBeginnerWinThreeRankedMatches'
QuestBeginnerWinTwoPracticeGames = require './questBeginnerWinTwoPracticeGames'
QuestBeginnerWinOneSeasonGame = require './questBeginnerWinOneSeasonGame'

# catch up quest
QuestCatchUp = require './questCatchUp.coffee'

# seasonal quests
QuestFrostfire2016 = require './questFrostfire2016.coffee'
QuestSeasonal2017February = require './questSeasonal2017February.coffee'
QuestSeasonal2017March = require './questSeasonal2017March.coffee'
QuestSeasonal2017April = require './questSeasonal2017April.coffee'
QuestSeasonal2017May = require './questSeasonal2017May.coffee'
QuestSeasonal2017October = require './questSeasonal2017October.coffee'
QuestSeasonal2018February = require './questSeasonal2018February.coffee'
QuestFrostfire2017 = require './questFrostfire2017.coffee'
QuestLegacyLaunch = require './questLegacyLaunch'

# Promo Quests
QuestAnniversary2017 = require './questAnniversary2017.coffee'

FactionsLookup = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'

GameSession = require 'app/sdk/gameSession'
CardFactory = require 'app/sdk/cards/cardFactory'
GameType = require 'app/sdk/gameType'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'

UtilsGameSession = require 'app/common/utils/utils_game_session'
_ = require 'underscore'
moment = require 'moment'
i18next = require 'i18next'

class QuestFactory

  # global cache for quick access
  @_questCache: null

  @SHORT_QUEST_GOLD: 150
  @LONG_QUEST_GOLD: 300

  # begin CONSTS DO NOT CHANGE # Iterate last by 100 for new quest base id
  @_FACTION_CHALLENGER_BASE_ID: 100
  @_FACTION_DOMINANCE_BASE_ID: 200
  @_KUMITE_INITIATE_ID: 300
  @_ASSASIN_MASTER_ID: 400
  @_ASSASIN_ID:401
  @_ULTIMATE_AGRESSOR_ID: 500
  @_SMALL_WORLD_ID: 600
  @_DOMINATOR_ID: 700
  @_ARCANYST_BANE_ID: 800
  @_CONSERVERS_CHALLENGE_ID: 900
  @_PATRONS_DUTY_ID: 1000
  @_MENTORS_TEACHING_ID: 1100
  @_SHORT_GENERAL_PARTICIPATION_BASE_ID: 1200
  @_SHORT_PARTICIPATION_ID: 1300
  @_SHORT_GAUNTLET_PARTICIPATION_ID: 1400
  @_LONG_PARTICIPATION_ID: 1500
  @_LONG_GENERAL_DESTROYER_ID: 1600
  @_LONG_MINION_SUMMON_ID: 1700
  @_LONG_MINION_DESTROYER_ID: 1800

  # end CONSTS DO NOT CHANGE #

  # Building out quests from here: https://docs.google.com/spreadsheets/d/1-PBRo9BeaJF8DeZ3Qdin305g5KurNxe0qNnyP48UvDw/edit#gid=2126045548
  @_generateQuestCache:()->
    Logger.module("SDK").debug("QuestFactory::_generateQuestCache - starting")

    allFactions = FactionFactory.getAllPlayableFactions()

    @_questCache = []

    # region Participation Quests
    # create partipation quests for each faction
    for faction in allFactions
      id = @_FACTION_CHALLENGER_BASE_ID + faction.id
      @_questCache.push new QuestParticipationWithFaction(id,[QuestType.ShortQuest],@SHORT_QUEST_GOLD,faction.id)
    # endregion Participation Quests

    # region Win Quests
    # create victory quests for each faction
    for faction in allFactions
      id = @_FACTION_DOMINANCE_BASE_ID + faction.id
      shortenedFactionName = faction.name?.split(" ")[0] # Pulls "Lyonar" out of the factionName "Lyonar Kingdom"
      @_questCache.push new QuestWinWithFaction(id,"#{shortenedFactionName} Dominance",[QuestType.ExcludeFromSystem],@SHORT_QUEST_GOLD,faction.id,shortenedFactionName)

    # Kumite Initiate Quest
    @_questCache.push(new QuestGameGoal(@_KUMITE_INITIATE_ID,"Kumite Initiate",[QuestType.ExcludeFromSystem],30,4,"Win 4 games with any Faction.",
      (gameSessionData,playerId) ->

        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        # Player has to win to make progress
        if (playerData.isWinner)
          return 1
        else
          return 0
    ))
    # endregion Win Quests

    # region Challenge Quests
    # Assassin quest
    @_questCache.push(new QuestGameGoal(@_ASSASIN_MASTER_ID,"Assassin Master",[QuestType.ExcludeFromSystem],20,2,"Destroy at least 5 minions in one game. Twice.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        if playerData.totalMinionsKilled >= 5
          return 1
        else
          return 0
    ))

    @_questCache.push(new QuestGameGoal(@_ASSASIN_ID,"Assassin",[QuestType.ExcludeFromSystem],20,1,"Destroy at least 5 minions in one game.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        if playerData.totalMinionsKilled >= 5
          return 1
        else
          return 0
    ))

    # Ultimate Agressor quest
    @_questCache.push(new QuestGameGoal(@_ULTIMATE_AGRESSOR_ID,"Ultimate Aggressor",[QuestType.ExcludeFromSystem],30,1,"Deal 40 damage in a single game.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        if playerData.totalDamageDealt >= 40
          return 1
        else
          return 0
    ))

    # Small World quest
    @_questCache.push(new QuestGameGoal(@_SMALL_WORLD_ID,"Small World",[QuestType.ExcludeFromSystem],20,2,"Win two games using only cards costing 3 or less.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        # Player has to win to make progress
        if (!playerData.isWinner)
          return 0

        # Player can't use any cards with cost greater than 3 to make progress
        playerGameSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSessionData,playerId)
        for cardData in playerGameSetupData.deck
          card = GameSession.getInstance().getOrCreateCardFromDataOrIndex(cardData)
          if (card?.getBaseManaCost() > 3)
            return 0

        # If above conditions are met, player makes 1 progress
        return 1
    ))

    # Dominator quest
    dominatorQuest = new QuestGameGoal(@_DOMINATOR_ID,"Dominator",[QuestType.ExcludeFromSystem],30,2,"Win 2 games of any type in a row.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        # Player has to win to make progress
        if (playerData.isWinner)
          return 1
        else
          return 0
    )
    dominatorQuest.setRequiresStreak()
    @_questCache.push(dominatorQuest)

    # Arcanyst Bane quest
    @_questCache.push(new QuestGameGoal(@_ARCANYST_BANE_ID,"Arcanyst Bane",[QuestType.ExcludeFromSystem],30,2,"Win 2 games with a deck containing less than 5 spells.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        # Player has to win to make progress
        if (!playerData.isWinner)
          return 0

        # Player can't use 5 or more spells and make progress
        playerGameSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSessionData,playerId)
        numSpells = 0
        for cardData in playerGameSetupData.deck
          card = GameSession.getInstance().getOrCreateCardFromDataOrIndex(cardData)
          if (CardType.getIsSpellCardType(card?.getType()))
            numSpells++

        # If player used less than desired number of spells makes 1 progress
        return (numSpells < 5) ? 1 : 0
    ))

    # Conserver's Challenge quest
    @_questCache.push(new QuestGameGoal(@_CONSERVERS_CHALLENGE_ID,"Conserver's Challenge",[QuestType.ExcludeFromSystem],25,1,"Win a game with a deck containing only Basic cards.",(gameSessionData,playerId) ->
      playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

      # Player has to win to make progress
      if (!playerData.isWinner)
        return 0

      # Player can't use any cards with cost greater than 3 to make progress
      playerGameSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSessionData,playerId)
      for cardData in playerGameSetupData.deck
        cardId = cardData.id
        card = GameSession.getInstance().createCardForIdentifier(cardId)
        if (card.getRarityId() != Rarity.Fixed) # Fixed is basic rarity
          return 0

      # If we reached here, no basic cards were found and game was won, 1 progress made
      return 1
    ))
    # endregion Challenge Quests


    # # region Social Quests
    # Patron's Duty Quest
    patronsQuest = new QuestGameGoal(@_PATRONS_DUTY_ID,"Patron's Duty",[QuestType.ExcludeFromSystem],30,4,"Play 4 games against a friend.",
      (gameSessionData,playerId) ->
        # redundant check with friendly matches count, but will leave in for readability
        if gameSessionData.gameType == GameType.Friendly
          return 1
        else
          return 0
    )
    patronsQuest.setFriendlyMatchesCount()
    @_questCache.push(patronsQuest)

    # Mentor's Teaching Quest
    mentorsQuest = new QuestGameGoal(@_MENTORS_TEACHING_ID,"Mentor's Teaching",[QuestType.ExcludeFromSystem],20,2,"Win two games against a friend.",
      (gameSessionData,playerId) ->
        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)
        # redundant check for isfriendly but will leave in for readability
        if playerData.isWinner and gameSessionData.gameType == GameType.Friendly
          return 1
        else
          return 0
    )
    mentorsQuest.setFriendlyMatchesCount()
    @_questCache.push(mentorsQuest)


    # endregion Social Quests

    # region Quests for Econ Update

    @_questCache.push(new QuestGameGoal(@_SHORT_PARTICIPATION_ID,"Conquerer",[QuestType.ExcludeFromSystem],@SHORT_QUEST_GOLD,5,"Play 5 games.",
      (gameSessionData,playerId) ->
        # Each game is always 1 progress
        return 1
    ))

    # TODO: Before activating, requires adding check for whether player can play Gauntlet
    @_questCache.push(new QuestGameGoal(@_SHORT_GAUNTLET_PARTICIPATION_ID,"Gauntlet Initiate",[QuestType.ExcludeFromSystem],@SHORT_QUEST_GOLD,3,"Play 3 Gauntlet games.",
      (gameSessionData,playerId) ->
        # Each gauntlet game is 1 progress
        if gameSessionData.gameType == GameType.Gauntlet
          return 1
        else
          return 0
    ))

    @_questCache.push(new QuestGameGoal(@_LONG_PARTICIPATION_ID,i18next.t("quests.quest_adventurer_title"),[QuestType.LongQuest],@LONG_QUEST_GOLD,8,i18next.t("quests.quest_adventurer_desc",{count:8}),
      (gameSessionData,playerId) ->
        # Each game is always 1 progress
        return 1
    ))

    @_questCache.push(new QuestGameGoal(@_LONG_GENERAL_DESTROYER_ID,i18next.t("quests.quest_ultimate_aggressor_title"),[QuestType.LongQuest],@LONG_QUEST_GOLD,150,i18next.t("quests.quest_ultimate_aggressor_desc",{count:150}),
      (gameSessionData,playerId) ->

        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        if playerData.totalDamageDealtToGeneral > 0
          # If a player won, and they did less than 25 damage to enemy general, give them 25 credit
          if playerData.isWinner and (playerData.totalDamageDealtToGeneral < 25)
            return 25
          else
            return playerData.totalDamageDealtToGeneral
        else
          return 0
    ))

    @_questCache.push(new QuestGameGoal(@_LONG_MINION_SUMMON_ID,"Minion Master",[QuestType.ExcludeFromSystem],@LONG_QUEST_GOLD,50,"Play 50 Minion cards.",
      (gameSessionData,playerId) ->

        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        if playerData.totalMinionsPlayedFromHand > 0
          return playerData.totalMinionsPlayedFromHand
        else
          return 0
    ))

    @_questCache.push(new QuestGameGoal(@_LONG_MINION_DESTROYER_ID,i18next.t("quests.quest_assassin_title"),[QuestType.LongQuest],@LONG_QUEST_GOLD,50,i18next.t("quests.quest_assassin_desc",{count:50}),
      (gameSessionData,playerId) ->

        playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,playerId)

        if playerData.totalMinionsKilled > 0
          return playerData.totalMinionsKilled
        else
          return 0
    ))



    # beginner Quests
    @_questCache.push(new QuestBeginnerWinPracticeGames())
    @_questCache.push(new QuestBeginnerPlayPracticeGames())
    @_questCache.push(new QuestBeginnerCompleteSoloChallenges())
    @_questCache.push(new QuestBeginnerWinOneSeasonGame())

    @_questCache.push(new QuestBeginnerFactionLevel())
    @_questCache.push(new QuestBeginnerPlayOneQuickMatch())
    @_questCache.push(new QuestBeginnerWinFourPracticeGames())
    @_questCache.push(new QuestBeginnerWinTwoPracticeGames())
    @_questCache.push(new QuestBeginnerWinThreeQuickMatches())
    @_questCache.push(new QuestBeginnerWinThreeRankedMatches())

    # Catch up quest
    @_questCache.push(new QuestCatchUp())

    # Seasonal Quests
    @_questCache.push(new QuestFrostfire2016())
    @_questCache.push(new QuestSeasonal2017February())
    @_questCache.push(new QuestSeasonal2017March())
    @_questCache.push(new QuestSeasonal2017April())
    @_questCache.push(new QuestSeasonal2017May())
    @_questCache.push(new QuestSeasonal2017October())
    @_questCache.push(new QuestFrostfire2017())
    @_questCache.push(new QuestSeasonal2018February())
    @_questCache.push(new QuestLegacyLaunch())

    # Promo Quests
    @_questCache.push(new QuestAnniversary2017())

  @questForIdentifier:(identifier)->
    if !@_questCache
      @_generateQuestCache()

    for quest in @_questCache
      if quest.id == identifier
        return quest

    return undefined

  # Based on quest slot type chances create a quest that isn't one of the excludedQuests
  @randomQuestForSlotExcludingIds: (slotIndex,excludedQuestIds) ->
    if !@_questCache
      @_generateQuestCache()

    # Get the type chances for this slot
    questChancesForSlot = @_questChancesForSlot(slotIndex)

    validQuestChanceTuples = []

    # Add any quests that fit parameters
    for questChanceTuple in questChancesForSlot
      sdkQuest = questChanceTuple[0]

      if _.contains(excludedQuestIds,sdkQuest.getId())
        continue

      if _.contains(sdkQuest.getTypes(),QuestType.ExcludeFromSystem)
        # Quests should primarily be blocked by generation by their existence in _questChancesForSlot
        console.warn("QuestFactory.randomQuestForSlotExcludingIds - quest with id #{sdkQuest.getId()} blocked from generation by type")
        continue

      validQuestChanceTuples.push(questChanceTuple)

    # This should never happen
    if validQuestChanceTuples.length == 0
      console.warn("QuestFactory.randomQuestForSlotExcludingIds - Zero valid quests")
      return @questForIdentifier(@_SHORT_PARTICIPATION_ID)

    chanceSum = _.reduce(validQuestChanceTuples,(memo,tuple) ->
      return memo + tuple[1]
    ,0)
    inverseChanceSum = 1.0 / chanceSum

    normalizedQuestChanceTuples = _.map(validQuestChanceTuples,(tuple) ->
      return [tuple[0],tuple[1] * inverseChanceSum]
    )

    questSeed = Math.random()
    currentPercentage = 0
    for questTuple in normalizedQuestChanceTuples
      currentPercentage += questTuple[1]
      if currentPercentage >= questSeed
        return questTuple[0]

    # Should never reach here
    # TODO: error logging
    return @questForIdentifier(@_SHORT_PARTICIPATION_ID)

  # Given a slot index, returns an array of tuples
  # Each tuple contains [Quest,percentage chance for Quest]
  @_questChancesForSlot: (slotIndex) ->
    if slotIndex == 0
      return   [
        [@questForIdentifier(@_FACTION_CHALLENGER_BASE_ID + FactionsLookup.Faction1),0.13],
        [@questForIdentifier(@_FACTION_CHALLENGER_BASE_ID + FactionsLookup.Faction2),0.13],
        [@questForIdentifier(@_FACTION_CHALLENGER_BASE_ID + FactionsLookup.Faction3),0.13],
        [@questForIdentifier(@_FACTION_CHALLENGER_BASE_ID + FactionsLookup.Faction4),0.13],
        [@questForIdentifier(@_FACTION_CHALLENGER_BASE_ID + FactionsLookup.Faction5),0.13],
        [@questForIdentifier(@_FACTION_CHALLENGER_BASE_ID + FactionsLookup.Faction6),0.13]
      ]
    else if slotIndex == 1
      return   [
        [@questForIdentifier(@_LONG_PARTICIPATION_ID),0.33],
        [@questForIdentifier(@_LONG_GENERAL_DESTROYER_ID),0.33],
        [@questForIdentifier(@_LONG_MINION_DESTROYER_ID),0.33]
      ]
    else
      console.warn("QuestFactory._questChancesForSlot - Should not reach here")
      return [[@questForIdentifier(@_SHORT_PARTICIPATION_ID),1.0]]

  ###*
  # Returns the available seasonal quest for the UTC time provided.
  # @public
  # @param  {Moment}  momentUtc  Pass in the current system time.
  # @return  {Quest}          Quest object or NULL if no seasonal quest available.
  ###
  @seasonalQuestForMoment: (momentUtc)->
    if !@_questCache
      @_generateQuestCache()
    seasonalQuests = _.filter(@_questCache, (q)-> return _.contains(q.types,QuestType.Seasonal))
    for q in seasonalQuests
      if q.isAvailableOn and q.isAvailableOn(momentUtc)
        return q

  ###*
  # Returns the available promotional quest for the UTC time provided.
  # @public
  # @param  {Moment}  momentUtc  Pass in the current system time.
  # @return  {Quest}          Quest object or NULL if no seasonal quest available.
  ###
  @promotionalQuestForMoment: (momentUtc)->
    if !@_questCache
      @_generateQuestCache()
    promoQuests = _.filter(@_questCache, (q)-> return _.contains(q.types,QuestType.Promotional))
    for q in promoQuests
      if q.isAvailableOn and q.isAvailableOn(momentUtc)
        return q

module.exports = QuestFactory
