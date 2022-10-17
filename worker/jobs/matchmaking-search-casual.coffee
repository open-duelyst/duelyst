###
Job - Search for Matches
###
_ = require 'underscore'
util = require 'util'
Promise = require 'bluebird'
moment = require 'moment'
Errors = require '../../server/lib/custom_errors.coffee'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
Consul = require '../../server/lib/consul'
env = config.get('env')
kue = require 'kue'

# SDK
GameType = require '../../app/sdk/gameType'
RankFactory = require '../../app/sdk/rank/rankFactory'

# redis
Redis = require '../../server/redis/'
casualQueue = new Redis.PlayerQueue(Redis.Redis, {name:'casual'})
casualDeckValueQueue = new Redis.PlayerQueue(Redis.Redis, {name:'casual-deck-value'})
rankedQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked'})
rankedDeckValueQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked-deck-value'})

###*
# 'getRequeueParams'
# Returns a Promise with the parameters for re-creating
# queue search jobs. Will pull the parameters from Consul
# or provide defaults when Consul isn't enabled
# @return {Promise} with parameters object
###
getRequeueParams = () ->
  # Defaults if Consul is disabled or fails
  defaults =
    searchRadiusIncrease: 0.5
    casualDeckRadiusIncrease: 0.5
    maxRankRadius: 30
    maxDeckValueRadius: 10
    delayMs: 2000
    allowMatchWithLastOpponent: config.get("matchmaking.allowMatchWithLastOpponent")

  if !config.get('consul.enabled')
    return Promise.resolve(defaults)

  Consul.kv.get("environments/#{process.env.NODE_ENV}/matchmaking-params.json")
  .then (v)->
    params = JSON.parse(v)
    params = _.extend(defaults,params)
    return params
  .catch (error) ->
    # Just return the defaults if polling Consul fails
    return defaults

###*
# 'requeueJob'
# Puts a search for game job back on the queue
# Logic to update searchRadius, delay, goes here
# @param  {Object} job    Kue job
###
requeueJob = (job, done) ->
  getRequeueParams()
  .then (params) ->

    # Logger.module("JOB").debug("[#{job.id}] getRequeueParams(): #{JSON.stringify(params)}")

    # Each attempt, we incease by parameters stored in Consul
    job.data.attempt++
    job.data.searchRadius += params.searchRadiusIncrease
    job.data.delayMs = params.delayMs
    job.data.lastAttemptAt = Date.now()
    firstMetric = job.data.timeServed
    secondMetric = job.data.deckValue

    Logger.module("JOB").debug("[#{job.id}] " + "casual".yellow + " -
      Search for Game (#{job.data.userId}) metric:#{job.data.rank}(#{firstMetric},#{secondMetric}),
      attempt #{job.data.attempt},
      delay #{job.data.delayMs}ms,
      searchRadius #{job.data.searchRadius}"
    )

    # Recreate as new job with updated parameters (and delayed)
    return new Promise (resolve, reject) ->
      Redis.Jobs.create("matchmaking-search-casual", job.data)
        .delay(job.data.delayMs)
        .removeOnComplete(true)
        .save (err) ->
          if err?
            return reject(err)
          else
            return resolve()
  .then () ->
    return done()
  .catch (error) ->
    return done(error)

###*
# 'logMatchMade'
# Logs that a match was made in the queue (used for wait time calculations)
# @param  {Object} player 1's matchmaking token
# @param  {Object} player 2's matchmaking token
###
logMatchMade = (token1, token2) ->
  now = Date.now()
  waitTime1 = now - token1.createdAt
  waitTime2 = now - token2.createdAt
  rank1 = token1.rank
  rank2 = token2.rank
  deckValue1 = token1.deckValue
  deckValue2 = token2.deckValue
  if token1.gameType == GameType.Casual
    division1 = "casual"
    casualQueue.matchMade(division1, waitTime1)
  else
    division1 = RankFactory.rankedDivisionAssetNameForRank(rank1)?.toLowerCase()
    rankedQueue.matchMade(division1, waitTime1)

  if token2.gameType == GameType.Casual
    division2 = "casual"
    casualQueue.matchMade(division2, waitTime2)
  else
    division2 = RankFactory.rankedDivisionAssetNameForRank(rank2)?.toLowerCase()
    rankedQueue.matchMade(division2, waitTime2)

  # calculate match quality
  rankDelta = Math.abs((rank1-rank2))
  rankDelta = Math.min(rankDelta,5)
  deckValueDelta = Math.abs((deckValue1-deckValue2))
  deckValueDelta = Math.min(deckValueDelta,5)
  matchQuality = 1 - (rankDelta+deckValueDelta)/10

###*
# 'findLockablePlayer'
# Find the first lockable player when provided with an array of player ids
# Recursive calls itself until lock is found
# Returns null if no lock found
# @param {Array} player ids
# @return {Object} lock, the locked player
# @return {String} lock.id, the player's id
# @return {Function} lock.unlock, the unlock function to call when done
###
findLockablePlayer = (players) ->
  if players.length == 0
    return null

  return Redis.TokenManager.lock(players[0])
  .then (unlock)->
    if _.isFunction(unlock)
      return {id: players[0], unlock: unlock}
    else
      players = players.slice(1)
      return findLockablePlayer(players)

###*
# Searches the queue for list of potential opponents
# Attempts to find lockable player
# @param   {String}   userId         filters out from search results
# @param   {String}   lastOpponentId     filters out from search results
# @param   {Integer}   rank
# @param   {Integer}   timeServed
# @param   {Integer}   deckValue
# @param   {Integer}   attempt
# @param   {Integer}   attemptInRanked
# @param   {Date}    firstAttemptAt    first attempt time
# @return   {Object}   [opponent: (see 'findLockablePlayer'), searchedRanked: true/false]
###
findOpponent = (userId, lastOpponentId, rank, timeServed, deckValue, attempt, attemptInRanked, firstAttemptAt) ->
  searchedRanked = false

  return getRequeueParams()
  .bind {}
  .then (params) ->
    this.allowMatchWithLastOpponent = params.allowMatchWithLastOpponent
    # update search radius
    scoreRadius = Math.floor(attempt * params.searchRadiusIncrease)
    scoreRadius = Math.min(scoreRadius, params.maxRankRadius)
    deckValueRadius = Math.floor(attempt * params.casualDeckRadiusIncrease)
    deckValueRadius = Math.min(deckValueRadius, params.maxDeckValueRadius)

    # prepare to search multiple queues
    # always search at least casual
    queueSearchPromises = [
      casualQueue.search({score: timeServed, searchRadius: scoreRadius})
      casualDeckValueQueue.search({score: deckValue, searchRadius: deckValueRadius})
    ]

    # search casual only until max deck search range is reached
    # CURRENTLY DISABLED
    # if scoreRadius == params.maxRankRadius
    #   searchedRanked = true
    #
    #   # update rank search radius
    #   rankRadius = Math.floor(attemptInRanked * params.searchRadiusIncrease)
    #   rankRadius = Math.min(rankRadius, params.maxRankRadius)
    #
    #   Logger.module("JOB").debug("Casual findOpponent from casual and ranked, deck #{deckValue} radius #{deckValueRadius} / rank #{rank} radius #{rankRadius}")
    #   queueSearchPromises.push(rankedQueue.search({score: rank, searchRadius: rankRadius}))
    #   queueSearchPromises.push(rankedDeckValueQueue.search({score: deckValue, searchRadius: deckValueRadius}))

    return Promise.all(queueSearchPromises)

  .spread (casualPlayersWithinSearch, casualPlayersWithinDeckValueSearch, rankedPlayersWithinRankSearch, rankedPlayersWithinDeckValueSearch) ->
    # exclude self from casual results
    opponents = _.filter(casualPlayersWithinSearch, (id) -> return id != userId)
    opponents = _.filter(casualPlayersWithinDeckValueSearch, (id) -> return id != userId)

    if rankedPlayersWithinRankSearch? and rankedPlayersWithinDeckValueSearch?
      # opponents from ranked must be within both RANK and DECK VALUE
      opponents = opponents.concat(_.intersection(rankedPlayersWithinRankSearch, rankedPlayersWithinDeckValueSearch))

    if !this.allowMatchWithLastOpponent and lastOpponentId
      # exclude last opponent from search
      opponents = _.filter(opponents, (id) -> return id != lastOpponentId)

    Logger.module("JOB").debug("Found #{opponents.length} potential matches (searched ranked:#{searchedRanked})")
    # return a locked opponent and whether we're also searching ranked
    return Promise.props({opponent: findLockablePlayer(opponents), searchedRanked: searchedRanked})

###*
# Job - 'matchmaking-search-casual'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  userId = job.data.userId || null
  if !userId
    return done(new Error("User ID is not defined."))

  # Logger.module("JOB").debug("[J:#{job.id}] Search for Game (#{userId})")

  # job data params
  # set defaults in none provided in initial job
  gameType = job.data.gameType || GameType.Ranked
  delayMs = job.data.delayMs = job.data.delayMs || 1000
  attempt = job.data.attempt = job.data.attempt || 1
  attemptInRanked = job.data.attemptInRanked = job.data.attemptInRanked || 1
  firstAttemptAt = job.data.firstAttemptAt = job.data.firstAttemptAt || Date.now()
  lastAttemptAt = job.data.lastAttemptAt = job.data.lastAttemptAt || Date.now()
  job.data.searchRadius = job.data.searchRadius || 0
  tokenId = job.data.tokenId

  # 1a. check if player *this* player is still in queue, otherwise done()
  # 1b. check if player *this* player is locked by another job, otherwise requeue()
  # 1c. check if this job matches the matchmaking tokenId, otherwise die since it's an old job for a cancelled matchmaking request
  # 2.  attempt to acquire lock on player
  # 3.  search the queue for other players based on rank and search radius
  # 4.  if no results found, then requeueJob()
  # 5.  if opponent found, we have a lock on the opponent, retrieve opponent's tokens
  # 6.  remove the players from the queue (delete their placeholder in queue and clear their tokens)
  # 7.  create game with both player's tokens

  isQueued = casualQueue.isPlayerQueued(userId)
  isLocked = Redis.TokenManager.isLocked(userId)

  # grab player token
  playerToken = Redis.TokenManager.get(userId)

  Promise.join isQueued, isLocked, playerToken, (isQueued, isLocked, playerToken) ->

    if !isQueued? or !playerToken?
      Logger.module("JOB").debug("[J:#{job.id}] player (#{userId}) is no longer queued (isQueued:#{isQueued})")
      return done() # the player is no longer in queue

    # save rank from player token in the job so the requeue method can use it
    rank = job.data.rank = parseInt(playerToken.rank)
    deckValue = job.data.deckValue
    timeServed = job.data.timeServed

    if isLocked
      Logger.module("JOB").debug("[J:#{job.id}] player (#{userId}) is locked (isLocked:#{isLocked})")
      return requeueJob(job, done) # the player is 'locked' by another job

    if playerToken.id != tokenId
      Logger.module("JOB").debug("[J:#{job.id}] this job's token #{tokenId} is outdated compared to #{playerToken.id}... killing job")
      return done() # looks like this job is for a token that has since been replaced

    Redis.TokenManager.lock(userId, 1000)
    .then (unlock) ->
      if !_.isFunction(unlock)
        Logger.module("JOB").debug("[J:#{job.id}] lock(#{userId}) acquire failed!")
        return requeueJob(job, done)
      else
        Logger.module("JOB").debug("[J:#{job.id}] lock(#{userId}) acquired - matchmaking metric #{rank},#{deckValue}.")
        return findOpponent(userId, playerToken.lastOpponentId, rank, timeServed, deckValue, attempt, attemptInRanked, firstAttemptAt)
        .then (searchData) ->
          opponent = searchData.opponent
          searchedRanked = searchData.searchedRanked
          if searchedRanked
            job.data.attemptInRanked++

          if !opponent
            # no opponents found, unlock and requeue
            unlock()
            return requeueJob(job, done)
          else
            Logger.module("JOB").debug("[J:#{job.id}] searchQueue(#{userId}): #{JSON.stringify(opponent)}")

            Redis.TokenManager.get(opponent.id)
            .bind {}
            .then (opponentToken) -> # TODO: We should validate results

              # Logger.module("JOB").debug("[J:#{job.id}] current ids: #{@token1} #{@token2}")

              @token1 = playerToken
              @token2 = opponentToken

              if not @.token1?.userId
                Logger.module("JOB").error("[J:#{job.id}] searchQueue(#{userId}): ERROR: player token has no user id")
                throw new Errors.NotFoundError("player token has no user id")
              if not @.token2?.userId
                Logger.module("JOB").error("[J:#{job.id}] searchQueue(#{userId}): ERROR: opponent token has no user id")
                throw new Errors.UnexpectedBadDataError("opponent token has no user id")

              # check whether opponent is also in casual or from ranked
              if @token2.gameType == GameType.Casual
                Logger.module("JOB").debug("[J:#{job.id}] searchQueue(#{userId}): found opponent from CASUAL")
                removalPromises = [
                  Redis.TokenManager.remove(@token1.userId)
                  Redis.TokenManager.remove(@token2.userId)
                  casualQueue.remove([@token1.userId,@token2.userId])
                  casualDeckValueQueue.remove([@token1.userId,@token2.userId])
                ]
              else
                Logger.module("JOB").debug("[J:#{job.id}] searchQueue(#{userId}): found opponent from RANKED")
                removalPromises = [
                  Redis.TokenManager.remove(@token1.userId)
                  Redis.TokenManager.remove(@token2.userId)
                  casualQueue.remove([@token1.userId])
                  casualDeckValueQueue.remove([@token2.userId])
                  rankedQueue.remove([@token2.userId])
                  rankedDeckValueQueue.remove([@token2.userId])
                ]

              return Promise.all(removalPromises)
            .then (results) -> # TODO: We should spread and validate results
              # mark match made
              logMatchMade(@token1, @token2)

              # log it
              Logger.module("JOB").debug("[J:#{job.id}]" + "casual".yellow + " - Search for Game (#{userId}) done(), matched versus #{@token2.userId}")
              job.log("Matched versus %s(%s)", @token2.userId, @token2.name)

              # Fire off job to setup game between both players
              Redis.Jobs.create('matchmaking-setup-game', {
                name: 'Matchmaking Setup Game',
                title: util.format('Game :: Setup Game :: %s versus %s', @token1.name, @token2.name),
                token1: @token1,
                token2: @token2,
                gameType: gameType
              }).removeOnComplete(true).save()

              # We're done
              return done(null, {opponentName: @token2.name})

            # if the player token is broken / not found, just error out
            .catch Errors.NotFoundError, (error)->
              return done(error)

            # if the opponent token unexpectedly had bad data, requeue this job
            .catch Errors.UnexpectedBadDataError, (error)->

              Logger.module("JOB").error("[J:#{job.id}] searchQueue(#{userId}): removing opponent token #{opponent.id} due to error")

              # dangling async removal of potentially bad opponent data
              Redis.TokenManager.remove(opponent.id)
              casualQueue.remove(opponent.id)
              casualDeckValueQueue.remove(opponent.id)
              rankedQueue.remove(opponent.id)
              rankedDeckValueQueue.remove(opponent.id)

              # manual unlock before requeue
              unlock()

              return requeueJob(job, done)

  .catch (error) ->
    return done(error)
