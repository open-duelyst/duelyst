###
Job - Search for Matches
###
_ = require 'underscore'
util = require 'util'
Promise = require 'bluebird'
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
arenaQueue = new Redis.PlayerQueue(Redis.Redis, {name:'gauntlet'})

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
		gauntletSearchRadiusIncrease: 1
		delayMs: 10000
		allowMatchWithLastOpponent: config.get("matchmakingDefaults.allowMatchWithLastOpponent")

	if !config.get('consul.enabled')
		return Promise.resolve(defaults)

	Consul.kv.get("environments/#{process.env.NODE_ENV}/matchmaking-arena-params.json")
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
# @param	{Object} job		Kue job
###
requeueJob = (job, done) ->
	getRequeueParams()
	.then (params) ->

		# Logger.module("MATCHMAKING-ARENA-JOB").debug("[#{job.id}] ARENA - getRequeueParams(): #{JSON.stringify(params)}")

		# Each attempt, we incease by parameters stored in Consul
		job.data.attempt++
		job.data.searchRadius += params.gauntletSearchRadiusIncrease
		job.data.delayMs = params.delayMs
		job.data.lastAttemptAt = Date.now()

		Logger.module("MATCHMAKING-ARENA-JOB").debug("[#{job.id}] #{job.data.gameType.yellow} -
			Search for Game (#{job.data.userId}) metric:(job.data.rank),
			attempt #{job.data.attempt},
			delay #{job.data.delayMs}ms,
			searchRadius #{job.data.searchRadius}"
		)

		# Recreate as new job with updated parameters (and delayed)
		return new Promise (resolve, reject) ->
			Redis.Jobs.create("matchmaking-search-arena", job.data)
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
# @param	{Object} player 1's matchmaking token
# @param	{Object} player 2's matchmaking token
###
logMatchMade = (token1, token2) ->
	now = Date.now()
	waitTime1 = now - token1.createdAt
	waitTime2 = now - token2.createdAt
	arenaQueue.matchMade("gauntlet", waitTime1)
	arenaQueue.matchMade("gauntlet", waitTime2)

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
# 'findOpponent'
# Searches the queue for list of potential opponents
# Attempts to find lockable player
# @param 	{String} 	userId, 			filters out from search results
# @param 	{String} 	lastOpponentId 		filters out from search results
# @param 	{Integer} 	rank
# @param 	{Integer} 	radius
# @return 	{Object} lock, see 'findLockablePlayer'
###
findOpponent = (userId, lastOpponentId, rank, radius) ->

	return getRequeueParams()
	.bind {}
	.then (params) ->
		this.allowMatchWithLastOpponent = params.allowMatchWithLastOpponent
		return arenaQueue.search({score: rank, searchRadius: radius})
	.then (players) ->

		# exclude the user that's looking
		players = _.filter(players, (id) -> return id != userId)

		# exclude last opponent
		if !this.allowMatchWithLastOpponent and lastOpponentId
			Logger.module("MATCHMAKING-ARENA-JOB").debug("excluding last opponent #{lastOpponentId?.blue}")
			players = _.filter(players, (id) -> return id != lastOpponentId)

		return findLockablePlayer(players)

###*
# Job - 'matchmaking-search-arena'
# @param	{Object} job		Kue job
# @param	{Function} done 	Callback when job is complete
###
module.exports = (job, done) ->
	userId = job.data.userId || null
	if !userId
		return done(new Error("User ID is not defined."))

	# Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] ARENA - Search for Game (#{userId})")

	# job data params
	# set defaults in none provided in initial job
	gameType = job.data.gameType || GameType.Gauntlet
	searchRadius = job.data.searchRadius = job.data.searchRadius || 0
	delayMs = job.data.delayMs = job.data.delayMs || 5000
	attempt = job.data.attempt = job.data.attempt || 1
	firstAttemptAt = job.data.firstAttemptAt = job.data.firstAttemptAt || Date.now()
	lastAttemptAt = job.data.lastAttemptAt = job.data.lastAttemptAt || Date.now()
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

	isQueued = arenaQueue.isPlayerQueued(userId)
	isLocked = Redis.TokenManager.isLocked(userId)

	# grab player token
	playerToken = Redis.TokenManager.get(userId)

	Promise.join isQueued, isLocked, playerToken, (isQueued, isLocked,playerToken) ->

		if !isQueued? or !playerToken?
			Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] player (#{userId}) is no longer queued (isQueued:#{isQueued})")
			return done() # the player is no longer in queue

		# isQueued is actually their current rank in the queue
		# let's save it onto the job so the requeue method can use it
		rank = job.data.rank = parseInt(isQueued)

		if isLocked
			Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] player (#{userId}) is locked (isLocked:#{isLocked})")
			return requeueJob(job, done) # the player is 'locked' by another job

		if playerToken.id != tokenId
			Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] this job's token #{tokenId} is outdated compared to #{playerToken.id}... killing job")
			return done() # looks like this job is for a token that has since been replaced

		Redis.TokenManager.lock(userId, 1000)
		.then (unlock) ->
			if !_.isFunction(unlock)
				Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] ARENA - lock(#{userId}) acquire failed!")
				return requeueJob(job, done)
			else
				# Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] ARENA - lock(#{userId}) acquired.")
				return findOpponent(userId, playerToken.lastOpponentId, rank, searchRadius)
				.then (opponent) ->
					if !opponent
						# no opponents found, unlock and requeue
						unlock()
						return requeueJob(job, done)
					else
						Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] ARENA - searchQueue(#{userId}): #{JSON.stringify(opponent)}")
						Redis.TokenManager.get(opponent.id)
						.bind {}
						.then (opponentToken) -> # TODO: We should validate results

							@token1 = playerToken
							@token2 = opponentToken

							if not @.token1?.userId
								Logger.module("MATCHMAKING-ARENA-JOB").error("[J:#{job.id}] searchQueue(#{userId}): ERROR: player token has no user id")
								throw new Errors.NotFoundError("player token has no user id")
							if not @.token2?.userId
								Logger.module("MATCHMAKING-ARENA-JOB").error("[J:#{job.id}] searchQueue(#{userId}): ERROR: opponent token has no user id")
								throw new Errors.UnexpectedBadDataError("opponent token has no user id")

							return Promise.all([
								Redis.TokenManager.remove(@token1.userId)
								Redis.TokenManager.remove(@token2.userId)
								arenaQueue.remove([@token1.userId,@token2.userId])
							])
						.then (results) -> # TODO: We should validate results
							# mark match made
							logMatchMade(@token1, @token2)

							# log it
							Logger.module("MATCHMAKING-ARENA-JOB").debug("[J:#{job.id}] #{gameType.yellow} - Search for Game (#{userId}) done(), matched versus #{@token2.userId}")
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

							Logger.module("MATCHMAKING-ARENA-JOB").error("[J:#{job.id}] searchQueue(#{userId}): removing opponent token #{opponent.id} due to error")

							# dangling async removal of potentially bad opponent data
							Redis.TokenManager.remove(opponent.id)
							arenaQueue.remove(opponent.id)

							# manual unlock before requeue
							unlock()

							return requeueJob(job, done)
	.catch (error) ->
		return done(error)
