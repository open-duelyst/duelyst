_ = require 'underscore'
express = require 'express'
router = express.Router()
expressJwt = require 'express-jwt'
util = require 'util'
Logger = require '../../app/common/logger.coffee'
CONFIG = require '../../app/common/config'
Promise = require 'bluebird'
moment = require 'moment'
CustomError = require '../lib/custom_errors.coffee'
isSignedIn = require '../middleware/signed_in'
t = require 'tcomb-validation'
validators = require '../validators'

# our modules
knex = require '../lib/data_access/knex'
UsersModule = require '../lib/data_access/users'
GauntletModule = require '../lib/data_access/gauntlet'
RiftModule = require '../lib/data_access/rift'
RankModule = require '../lib/data_access/rank'
InventoryModule = require '../lib/data_access/inventory'

GameType = require '../../app/sdk/gameType'
GameSession = require '../../app/sdk/gameSession'
Cards = require '../../app/sdk/cards/cardsLookupComplete'
RarityFactory = require '../../app/sdk/cards/rarityFactory'
Rarity = require '../../app/sdk/cards/rarityLookup'
FactionsLookup = require '../../app/sdk/cards/factionsLookup'
FactionFactory = require '../../app/sdk/cards/factionFactory'
RankFactory = require '../../app/sdk/rank/rankFactory'
RankDivisionLookup = require '../../app/sdk/rank/rankDivisionLookup'
CosmeticsFactory = require '../../app/sdk/cosmetics/cosmeticsFactory'

createSinglePlayerGame = require '../lib/create_single_player_game'

isMatchmakingActiveAsync = require '../../worker/get_matchmaking_status.coffee'
getGameServerAsync = require '../../worker/get_gameserver.coffee'

# redis
Redis = require '../redis/'
rankedQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked'})
arenaQueue = new Redis.PlayerQueue(Redis.Redis, {name:'gauntlet'})
riftQueue = new Redis.PlayerQueue(Redis.Redis, {name:'rift'})
rankedDeckValueQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked-deck-value'})
casualQueue = new Redis.PlayerQueue(Redis.Redis, {name:'casual'})
casualDeckValueQueue = new Redis.PlayerQueue(Redis.Redis, {name:'casual-deck-value'})

# Configuration object
config = require '../../config/config.js'
env = config.get('env')
{version} = require '../../version'

## Require authentication
router.use '/matchmaking', isSignedIn

###*
# Router - POST - /matchmaking
# Enters matchmaking queue
# - validate request data {deck, factionId, gameType}
# - validate deck
# - check consul for maintenance status
# - generate 'token' for request containing all request data
# - push player to queue (currently defaults to 'rankedQueue')
# - if inviteId, calls setupInviteGame
# - respond 200 with token id, player can use this token id to check status or listen to errors via Firebase
# - fire off a search/match player job
###
router.post "/matchmaking", (req, res, next) ->
  result = t.validate(req.body, validators.matchmakingInput)
  if not result.isValid()
    return res.status(400).json(result.errors)

  userId = req.user.d.id
  inviteId = result.value.inviteId
  name = result.value.name
  deck = result.value.deck
  factionId = result.value.factionId
  cardBackId = result.value.cardBackId
  battleMapId = result.value.battleMapId
  hasPremiumBattleMaps = result.value.hasPremiumBattleMaps || false
  gameType = result.value.gameType
  ticketId = result.value.ticketId
  battleMapIndexesToSampleFrom = null # will be configured later based on inputs

  if hasPremiumBattleMaps and not battleMapId?
    Logger.module("MATCHMAKING").debug "#{userId} wants RANDOM battlemap"
  else if battleMapId?
    Logger.module("MATCHMAKING").debug "#{userId} wants battlemap #{battleMapId}"

  Logger.module("MATCHMAKING").debug "#{gameType.yellow} queue request for user: #{userId}"
  #Logger.module("MATCHMAKING").debug "Request payload: #{util.inspect(req.body)} ".blue

  if inviteId
    Logger.module("MATCHMAKING").debug "#{gameType.yellow} request for user: #{userId} : invite request with inviteId #{inviteId}"

  return isMatchmakingActiveAsync()
  .bind {}
  .then () ->
    # check if the player is already waiting for a game, ie. they have a 'game' token
    return Redis.TokenManager.get(userId)
  .then (token) ->
    if token?
      # player is already waiting for a game
      return res.status(200).json({ tokenId: token.id })
    else
      findDeckPromise = () ->
        if gameType == GameType.Ranked
          return Promise.resolve(deck)
#        else if gameType == GameType.Casual
#          return Promise.resolve(deck)
        else if gameType == GameType.Friendly
          return Promise.resolve(deck)
        else if gameType == GameType.Gauntlet
          return GauntletModule.getArenaDeck(userId)
#        else if gameType == GameType.Rift
#          return RiftModule.getRiftRunDeck(userId,ticketId)
        else
          return Promise.reject(new Error("Unknown GAME TYPE: #{gameType}"))

      findRiftRatingIfNeeded = () ->
        if gameType == GameType.Rift
          return RiftModule.getRunRating(userId,ticketId)
        else
          return Promise.resolve(null)

      # find the user's set up data
      return Promise.all([
        findDeckPromise(),
        findRiftRatingIfNeeded()
      ])
      .bind {}
      .spread (deck,riftRunRating) ->
        # map deck for correct formatting and anti-cheat
        deck = _.map(deck, (card)->
          if _.isString(card) or _.isNumber(card)
            return { id: card }
          else if card.id?
            return { id: card.id }
        )

        # Logger.module("MATCHMAKING").debug("deck:", @.deck)
        @.deck = deck
        @.riftRunRating = riftRunRating

        return Promise.all([
          # if no selected battlemap, but user wants a random battlemap from their set, grab the battlemaps they own and add them to the list
          (if hasPremiumBattleMaps and not battleMapId? then knex("user_cosmetic_inventory").select("cosmetic_id").where("cosmetic_id", ">", 50000).andWhere("cosmetic_id", "<", 60000).andWhere("user_id", userId) else Promise.resolve())
          # check whether user is allowed to use this deck
          (if gameType == GameType.Gauntlet or gameType == GameType.Rift then Promise.resolve() else UsersModule.isAllowedToUseDeck(userId, @.deck, gameType, ticketId)),
          # check whether user is allowed to use this card back
          (if cardBackId? then InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId,cardBackId) else Promise.resolve()),
          # check if user is allowed to use the selected battlemap
          (if battleMapId? then InventoryModule.isAllowedToUseCosmetic(Promise.resolve(), knex, userId, battleMapId) else Promise.resolve())
        ])
      .spread (ownedBattleMapCosmeticRows)->

        if battleMapId?
          Logger.module("MATCHMAKING").debug "#{userId} selected battlemap: #{battleMapId}"
          battleMapIndexesToSampleFrom ?= [ CosmeticsFactory.cosmeticForIdentifier(battleMapId).battleMapTemplateIndex ]
        else if ownedBattleMapCosmeticRows?.length > 0
          Logger.module("MATCHMAKING").debug "#{userId} owns following battlemaps: #{ownedBattleMapCosmeticRows}"
          ownedIndexes = _.map ownedBattleMapCosmeticRows,(r)-> return CosmeticsFactory.cosmeticForIdentifier(r.cosmetic_id).battleMapTemplateIndex
          battleMapIndexesToSampleFrom ?= _.union(CONFIG.BATTLEMAP_DEFAULT_INDICES,ownedIndexes)

        Logger.module("MATCHMAKING").debug "#{userId} battle map indexes: #{battleMapIndexesToSampleFrom}"

        # find rank metric
        if gameType == GameType.Gauntlet
          findRankMetricPromise = GauntletModule.getRunMatchmakingMetric(userId)
        else if gameType == GameType.Rift
          findRankMetricPromise = RiftModule.getRunMatchmakingMetric(userId,ticketId)
        else
          findRankMetricPromise = RankModule.getCurrentSeasonRank(userId)

        riftRatingPromise = Promise.resolve(null)
        if (gameType == GameType.Rift)
          riftRatingPromise = RiftModule.getRunRating(userId,ticketId)

        return Promise.all([
          findRankMetricPromise,
          knex("users").where('id',userId).first('top_rank'),
          knex("user_progression").where('user_id',userId).first('loss_streak','win_streak','win_count','loss_count','game_count','last_opponent_id'),
          knex("users").where('is_bot',true).offset(knex.raw('floor(random()*110)')).first('id','username')
        ])
      .spread (rankMetric,rankRow,lossStreakRow,randomBotRow) ->

        lossStreak = lossStreakRow?.loss_streak || 0
        winStreak = lossStreakRow?.win_streak || 0
        win_count = lossStreakRow?.win_count || 0
        loss_count = lossStreakRow?.loss_count || 0
        game_count = lossStreakRow?.game_count || 0
        last_opponent_id = lossStreakRow?.last_opponent_id || null
        if rankRow?.top_rank == 0
          topRank = 0
        else
          topRank = rankRow?.top_rank || 30

        # if we're matching into the season ladder, and are one of:
        #  1. new player (0 wins)
        #  2. on a 3 or more game losing streak in Bronze division or top of Silver division
        # we will add a probability to match you against a practice bot where you have a decent chance to win
        maxWinsBeforeNoBot = 30
        isLadderGame = gameType != GameType.Gauntlet and gameType != GameType.Friendly and gameType != GameType.Casual
        isPlayerEligibleForBots = rankMetric >= RankDivisionLookup.Silver
        botProbability = 0.33 * lossStreak - win_count / maxWinsBeforeNoBot
        botProbability = Math.max(0,botProbability)
        botProbability = if gameType == GameType.Rift then 1.0 else botProbability
        # if this user's NEVER won a game, give them a bot 100% of the time
        if win_count == 0
          botProbability = 1.0
        Logger.module("MATCHMAKING").debug "#{gameType.yellow} request for user: #{userId} : rank metric: #{rankMetric} : eligible for bot: #{isPlayerEligibleForBots} : bot probability #{botProbability}"
        if randomBotRow? and isLadderGame and isPlayerEligibleForBots and (Math.random() < botProbability)
          Logger.module("MATCHMAKING").debug "matching #{userId} with bot"
          # create token
          token = Redis.TokenManager.create({
            userId: userId
            name: name
            deck: @.deck
            factionId: factionId
            cardBackId: cardBackId
            battleMapIndexes: battleMapIndexesToSampleFrom
            gameType: gameType
            ticketId: ticketId
            inviteId: inviteId
            rank: rankMetric
            riftRating: @.riftRunRating
          })

          # start bot game process, but don't return this promise
          Promise.all([
            # add token so we can track whether user is still in matchmaking
            Redis.TokenManager.add(token),
            # after 5-10s match them into bot mode
            Promise.delay(5000 + Math.random() * 5000)
          ]).spread ()->
            # check if player is still in matchmaking
            return Redis.TokenManager.get(userId)
            .then (existingToken) ->
              if !existingToken?
                Logger.module("MATCHMAKING").debug "#{userId} no longer in matchmaking, cancelling bot game!"
              else if parseInt(existingToken.createdAt) != parseInt(token.createdAt)
                Logger.module("MATCHMAKING").debug "#{userId} re-entered matchmaking, cancelling bot game!"
              else
                Logger.module("MATCHMAKING").debug "#{userId} still in matchmaking, creating bot game"
                # get random faction
                aiFactionId = _.sample([
                  FactionsLookup.Faction1,
                  FactionsLookup.Faction2,
                  FactionsLookup.Faction3,
                  FactionsLookup.Faction4,
                  FactionsLookup.Faction5,
                  FactionsLookup.Faction6
                ])

                # get random general from faction
                aiGeneralId = _.sample(FactionFactory.generalIdsForFaction(aiFactionId).slice(0,2))

                # ramp difficulty from 20% to max
                aiDifficulty = 0.2 + 0.8 * Math.min(1.0, Math.max(0, win_count - loss_count) / 10)

                # bots should use around ~12 random cards
                aiNumRandomCards = Math.floor(CONFIG.MAX_DECK_SIZE * 0.3)

                return Promise.all([
                  # remove user from token manager
                  Redis.TokenManager.remove(userId)
                  # create game
                  createSinglePlayerGame(userId,name,gameType,existingToken.deck,cardBackId,battleMapIndexesToSampleFrom,randomBotRow.id,randomBotRow.username,aiGeneralId,null,aiDifficulty,aiNumRandomCards,null,ticketId,null)
                ])
          .catch (error) ->
            Logger.module("MATCHMAKING").error "ERROR: bot match for #{userId} failed! #{error.messsage or error}".red
            # remove user from token manager
            Redis.TokenManager.remove(userId)

            throw new Error("Match found but game failed to setup!")

          # respond with tokenId
          return res.status(200).json({ tokenId: token.id })

        else

          division = RankFactory.rankedDivisionAssetNameForRank(rankMetric)?.toLowerCase()

          # calculate spirit value of the deck
          deckSpiritValue = _.reduce(@.deck,(memo,deckCard)->
            deckCardId = deckCard.id
            sdkCard = _.find(GameSession.getCardCaches().getCards(),(c)-> return c.getId() == deckCardId)
            rarityData = RarityFactory.rarityForIdentifier(sdkCard.getRarityId())
            if rarityData?
              if Cards.getIsPrismaticCardId(sdkCard.getId())
                spiritCost = rarityData.spiritCostPrismatic
              else
                spiritCost = rarityData.spiritCost
              memo += spiritCost
          ,0)

          # normalize deck spirit value between 0 and 10
          deckSpiritValue = deckSpiritValue / CONFIG.MAX_EFFECTIVE_SPIRIT_VALUE
          deckSpiritValue = Math.round(deckSpiritValue * 10)
          deckSpiritValue = Math.min(deckSpiritValue,10)

          # rank metric is the rank and has a minimum of 0
          rankMetric = Math.max(rankMetric,0)

          # time served metric is 0-30 like rank
          timeServed = timeServedMetric(game_count, win_count, winStreak, rankMetric, topRank)

          # Logger.module("MATCHMAKING").debug "#{gameType.yellow} queing #{userId} : matchmaking metrics: (#{rankMetric},#{deckSpiritValue},#{timeServed})"

          # TAG: game set up: vs ranked player create token
          tokenData = {
            userId: userId
            name: name
            deck: @.deck
            factionId: factionId
            cardBackId: cardBackId
            battleMapIndexes: battleMapIndexesToSampleFrom
            gameType: gameType
            inviteId: inviteId
            ticketId: ticketId
            rank: rankMetric
            deckValue: deckSpiritValue
            lastOpponentId: last_opponent_id
            riftRating: @.riftRunRating
          }

          if inviteId?
            tokenData.lastOpponentId = null
          token = Redis.TokenManager.create(tokenData)

          Logger.module("MATCHMAKING").debug "creating token for #{userId}: ", tokenData

          if inviteId
            matchmakingPromises = [
              Redis.TokenManager.add(token)
              Redis.InviteQueue.add(userId, inviteId)
            ]
          else if gameType == GameType.Casual
            matchmakingPromises = [
              Redis.TokenManager.add(token)
              casualQueue.add(userId,timeServed)
              casualDeckValueQueue.add(userId,deckSpiritValue)
              casualQueue.velocity("casual")
            ]
          else if gameType == GameType.Ranked
            matchmakingPromises = [
              Redis.TokenManager.add(token)
              rankedQueue.add(userId,rankMetric)
              rankedDeckValueQueue.add(userId,deckSpiritValue)
              rankedQueue.velocity(division)
            ]
          else if gameType == GameType.Gauntlet
            matchmakingPromises = [
              Redis.TokenManager.add(token)
              arenaQueue.add(userId,rankMetric)
              arenaQueue.velocity("gauntlet")
            ]
          else if gameType == GameType.Rift
            matchmakingPromises = [
              Redis.TokenManager.add(token)
              riftQueue.add(userId,rankMetric)
              riftQueue.velocity("rift")
            ]

          return Promise.all(matchmakingPromises)
          .then (results) -> # TODO: We should spread and validate results

            if gameType == GameType.Friendly and inviteId
              Logger.module("MATCHMAKING").debug "#{gameType.yellow} invite set up for user #{userId}, sending 200 with #{token.id}".green
              res.status(200).json({ tokenId: token.id })
              setupInvite(inviteId)
              return
            else if gameType == GameType.Casual
              velocity = results[2]
              Logger.module("MATCHMAKING").debug "#{gameType.yellow} queue pushed user #{userId}, sending 200 with #{token.id}, #{velocity}".green
              res.status(200).json({ tokenId: token.id, velocity: velocity })
              # fire off matchmaking job
              Redis.Jobs.create('matchmaking-search-casual', {
                name: "Casual Matchmaking Search"
                title: util.format('GAME :: %s searching for casual game', name)
                userId: userId
                gameType: gameType
                tokenId: token.id
                rank: token.rank
                deckValue: token.deckValue
                timeServed: timeServed
              }).delay(1000).removeOnComplete(true).save()
              return
            else if gameType == GameType.Ranked
              velocity = results[3]
              Logger.module("MATCHMAKING").debug "#{gameType.yellow} queue pushed user #{userId}, sending 200 with #{token.id}, #{velocity}".green
              res.status(200).json({ tokenId: token.id, velocity: velocity })
              # fire off matchmaking job
              Redis.Jobs.create('matchmaking-search-ranked', {
                name: "Ranked Matchmaking Search"
                title: util.format('GAME :: %s searching for game', name)
                userId: userId
                gameType: gameType
                tokenId: token.id
                rank: token.rank
                deckValue: token.deckValue
              }).delay(1000).removeOnComplete(true).save()
              return
            else if gameType == GameType.Gauntlet
              velocity = results[2]
              Logger.module("MATCHMAKING").debug "#{gameType.yellow} queue pushed user #{userId}, sending 200 with #{token.id}, #{velocity}".green
              res.status(200).json({ tokenId: token.id, velocity: velocity })
              # fire off matchmaking job
              Redis.Jobs.create('matchmaking-search-arena', {
                name: "Arena Matchmaking Search"
                title: util.format('GAME :: %s searching for arena game', name)
                userId: userId
                gameType: gameType
                tokenId: token.id
                rank: token.rank
                deckValue: token.deckValue
              }).delay(1000).removeOnComplete(true).save()
              return
            else if gameType == GameType.Rift
              velocity = results[2]
              Logger.module("MATCHMAKING").log "#{gameType.yellow} queue pushed user #{userId}, sending 200 with #{token.id}, #{velocity}".green
              res.status(200).json({ tokenId: token.id, velocity: velocity })
              # fire off matchmaking job
              Redis.Jobs.create('matchmaking-search-rift', {
                name: "Rift Matchmaking Search"
                title: util.format('GAME :: %s searching for rift game', name)
                userId: userId
                gameType: gameType
                tokenId: token.id
                rank: token.rank
                deckValue: token.deckValue
              }).delay(1000).removeOnComplete(true).save()
              return
  .catch CustomError.NoArenaDeckError, (error) ->
    Logger.module("MATCHMAKING").error "Request #{userId} : attempting to enter arena queue without active deck!".red
    return res.status(400).json({ error: error.message })
  .catch CustomError.InvalidDeckError, (error) ->
    Logger.module("MATCHMAKING").error "Request #{userId} : attempting to use invalid deck!".red
    return res.status(400).json({ error: error.message })
  .catch CustomError.MatchmakingOfflineError, (error) ->
    Logger.module("MATCHMAKING").error "Request #{userId} : Matchmaking is currently offline".red
    return res.status(400).json({ error: error.message })
  .catch (error) ->
    Logger.module("MATCHMAKING").error "ERROR: Request.post /matchmaking #{userId} failed!".red
    return next(error)

###*
# Router - GET - /matchmaking
# Returns a player's current matchmaking token or 404
###
router.get "/matchmaking", (req, res, next) ->
  userId = req.user.d.id

  Redis.TokenManager.get(userId)
  .then (token) ->
    if token?
      return res.status(200).json(token)
    else
      return res.status(404).end()
  .catch (error) ->
    Logger.module("MATCHMAKING").error "ERROR: Request.get /matchmaking #{userId} failed!".red
    return next(error)

###*
# Router - DELETE - /matchmaking
# Removes a player from queue & deletes their game token
###
router.delete "/matchmaking", (req, res, next) ->
  userId = req.user.d.id

  return Promise.all([
    Redis.TokenManager.remove(userId)
    rankedQueue.remove(userId)
    rankedDeckValueQueue.remove(userId)
    casualQueue.remove(userId)
    casualDeckValueQueue.remove(userId)
    arenaQueue.remove(userId)
  ])
  .then (results) ->
    return res.status(204).end()
  .catch (error) ->
    Logger.module("MATCHMAKING").error "ERROR: Request.delete /matchmaking #{userId} failed!".red
    return next(error)

###*
# Setup a invite based game
# Does nothing if there's only 1 player in the list
# @param {String} inviteId
###
setupInvite = (inviteId) ->
  Logger.module("MATCHMAKING").debug "setupInvite(#{inviteId})".blue

  Redis.InviteQueue.count(inviteId)
  .then (playerCount) ->
    if playerCount < 2
      return # there's only 1 player

    return Redis.InviteQueue.grab(inviteId)
    .bind {}
    .then (results) -> # TODO: we should verify results
      @playerId1 = results[0]
      @playerId2 = results[1]

      return Promise.all([
        Redis.TokenManager.get(@playerId1)
        Redis.TokenManager.get(@playerId2)
      ])
    .then (results) -> # TODO: we should verify results
      @token1 = results[0]
      @token2 = results[1]

      return Redis.TokenManager.remove([@playerId1,@playerId2])
    .then () ->
      # Fire off job to setup game between both players
      Redis.Jobs.create('matchmaking-setup-game', {
        name: "Matchmaking Setup Game"
        title: util.format('Game :: Setup Invite Game :: %s versus %s', @token1.name, @token2.name),
        token1: @token1,
        token2: @token2,
        gameType: GameType.Friendly
      }).removeOnComplete(true).save()
      return
    .catch (error) ->
      Logger.module("MATCHMAKING").error "setupInvite() failed: #{error.message}".red

###*
# OLD timeServedMetric OLD
# If less than 100 games, use games played instead of rank
# Normalize # of games to 0 - 30 score
# Adjust score for number of wins
# Adjust score if on a win streak
# If more than 100 games, use average of current rank and top rank
timeServedMetric = (gameCount, winCount, winStreak, rank, topRank = 30) ->
  if (gameCount <= 99)
    # Logger.module("MATCHMAKING").debug("gameCount: #{gameCount}, winCount: #{winCount}, winStreak: #{winStreak}")
    timeServed = (1 - (gameCount / 100)) * 30
    winCountAdjust = Math.min(winCount, timeServed)
    winStreakAdjust = Math.min(0.5 * winStreak, timeServed)
    timeServed -= winCountAdjust
    timeServed -= winStreakAdjust
    # Logger.module("MATCHMAKING").debug("timeServed: #{timeServed}")
  else
    timeServed = (rank + topRank) / 2
  return Math.min(Math.round(timeServed),0)
###

###
# Simple time served metric
# if less than 20 games, normalize by WIN COUNT to rank 30-20
# if more than 20 games but less than 100 games, normalize by win rate to rank 30-10
# if more than 100 games, use average of current rank and top rank ever achieved
###
timeServedMetric = (gameCount, winCount, winStreak, rank, topRank = 30) ->
  if (gameCount < 20)
    timeServed = Math.round(30 - (winCount * .5)) # 30 - 20 by wins
  else if (gameCount < 100)
    timeServed = Math.round((1 - (winCount / gameCount) * 20)) + 10 # 30 - 10 by win rate
  else
    timeServed = (rank + topRank) / 2 # use ranked queue rank
  return Math.min(Math.round(timeServed),0)

module.exports = router
