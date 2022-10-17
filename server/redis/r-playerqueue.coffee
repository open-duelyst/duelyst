_ = require 'underscore'
Promise = require 'bluebird'
crypto = require 'crypto'
ts = require './r-timeseries'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get("env")

# Helper returns the Redis key prefix
keyPrefix = () ->
  return "#{env}:matchmaking:"

# Helper returns a random string of specified length
randomString = (length) ->
  crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length)

# Helper returns a random key
randomKey = () ->
  randomString(8)

# Defaults used in constructor
defaults =
  name: randomKey()

###*
# Class 'RedisPlayerQueue'
# Manages player queue data structure in Redis
# Player queues are sorted sets (zset), sorted by rank
# Create for each different player queue, ie: normal, ranked, casual
# Contains 5 timeseries to queue velocity by division
###
module.exports = class RedisPlayerQueue
  ###*
  # Constructor
  # Gives itself a random name if none specified
  # @param {Object} redis, a promisified redis connection
  # @param {Object} options, opts.name sets the queue's name
  ###
  constructor: (redis, opts = {}) ->
    # TODO: add check to ensure Redis client is already promisified
    @redis = redis
    @name = opts.name || defaults.name
    @queue = keyPrefix() + "queue:#{@name}"

    # Timeseries initialization
    @ts_bronze = new ts(@redis, {name:"#{@name}:bronze"})
    @ts_silver = new ts(@redis, {name:"#{@name}:silver"})
    @ts_gold = new ts(@redis, {name:"#{@name}:gold"})
    @ts_diamond = new ts(@redis, {name:"#{@name}:diamond"})
    @ts_elite = new ts(@redis, {name:"#{@name}:elite"})
    @ts_gauntlet = new ts(@redis, {name:"#{@name}:gauntlet"})
    @ts_casual = new ts(@redis, {name:"#{@name}:casual"})

    # Logger.module("REDIS").log("playerqueue(#{@name}) - #{@queue}")
    return

  ###*
  # Add player to *this* queue
  # @param {String} playerId
  # @param {Integer} rank
  # @return {Promise} number of elements added to the zset
  ###
  add: (playerId, rank = 30) ->
    # Logger.module("REDIS-QUEUE").log("add(#{playerId}, #{rank})")
    return @redis.zaddAsync(@queue, rank, playerId)

  ###*
  # Remove a player or players from *this* queue in single op
  # @param {String|Array} playerId or array of playerIds
  # @return {Promise} number of elements removed fom the zset
  ###
  remove: (playerIds) ->
    # Logger.module("REDIS-QUEUE").log("remove(#{playerIds})")
    args = []
    args.push(@queue)
    if _.isArray(playerIds)
      _.each playerIds, (playerId) ->
        args.push(playerId)
    else
      args.push(playerIds)
    return @redis.zremAsync(args)

  ###*
  # Return player's current rank (zscore) in *this* queue
  # Returns null if the player is not queued
  # @param {String} playerId
  # @return {Promise} current rank in queue
  ###
  isPlayerQueued: (playerId) ->
    # Logger.module("REDIS-QUEUE").log("isPlayerQueued(#{playerId})")
    return @redis.zscoreAsync(@queue, playerId)

  ###*
  # Return the number of players in the queue
  # @return {Promise} number of players
  ###
  count: () ->
    # Logger.module("REDIS-QUEUE").log("count()")
    return @redis.zcardAsync(@queue)

  ###*
  # Search the queue for players between matchmaking score metrics
  # Providing score and search radius as parameters
  # @param {Object} options, opts.score, opts.searchRadius
  # @return {Promise} an array of matching player ids
  ###
  search: (opts = {}) ->
    if opts.score == undefined
      score = 30
    else
      score = opts.score
    searchRadius = opts.searchRadius || 0
    # calculate min/max by search readius
    min = Math.max(score - searchRadius, 0)  # minimum matchmaking metric is 0
    max = Math.min(score + searchRadius, 300) # maximum matchmaking metric is 300
    # Logger.module("REDIS-QUEUE").log "searchQueue(#{score}) between [#{min},#{max}]"
    return @redis.zrangebyscoreAsync(@queue, min, max)

  ###*
  # Return all players in the queue
  # withScores option includes each player's rank (zscore)
  # @param {Object} options, opts.withScores
  # @return {Promise} array [player1,...,playerN] | [player1,rank1,...,playerN,rankN]
  ###
  grab: (opts = {}) ->
    # Logger.module("REDIS-QUEUE").log("grab()")
    withScores = opts.withScores || false
    if withScores
      return @redis.zrangeAsync(@queue, 0, -1, "WITHSCORES")
    else
      return @redis.zrangeAsync(@queue, 0, -1)

  ###*
  # Mark a hit in our time series when a match is made
  # Rounds values that are too low or too high
  # @param {String} the division the match was made
  # @param {Integer} in ms, the time spent waiting in queue
  ###
  matchMade: (division, waitTime) ->
    Logger.module("REDIS-QUEUE").debug("matchMade(#{division},#{waitTime})")

    switch division
      when "bronze" then ts = @ts_bronze
      when "silver" then ts = @ts_silver
      when "gold" then ts = @ts_gold
      when "diamond" then ts = @ts_diamond
      when "elite" then ts = @ts_elite
      when "gauntlet" then ts = @ts_gauntlet
      when "casual" then ts = @ts_casual
      else ts.hit = ->

    # Set a bound on waitTime hits, between [1 minute and 10 minutes]
    # if waitTime < 60000 # 1 minute in ms
    #   waitTime = 60000

    if waitTime > 600000 # 10 minutes in ms
      waitTime = 600000

    # TODO: want to validate the timestamp as bad data will mess up calculations
    # recording a hit with the timestamp as the value
    ts.hit(waitTime)
    return

  ###*
  # Calculates the queue velocity by division
  # Averages the last hour of wait times in the queue
  # @param {String} the division to calculate velocity for
  # @return {Promise} in ms, the average wait time
  ###
  velocity: (division) ->
    # Logger.module("REDIS-QUEUE").log("velocity(#{division})")

    # this sucks, part deux
    switch division
      when "bronze" then ts = @ts_bronze
      when "silver" then ts = @ts_silver
      when "gold" then ts = @ts_gold
      when "diamond" then ts = @ts_diamond
      when "elite" then ts = @ts_elite
      when "gauntlet" then ts = @ts_gauntlet
      when "casual" then ts = @ts_casual
      else return Promise.resolve(60000)

    # defaults to 1hr, query the time series
    ts.query().then (results) ->

      # size = total number of matches made in query range
      size = _.size(results)
      sum = _.reduce(results, ((memo, num) -> memo + parseInt(num)), 0)
      avg = Math.floor(sum / size)

      # console.log "durations " + results
      # console.log "size " + size
      # console.log "sum (mins) " + sum / 60000
      # console.log "avg (mins) " + avg / 60000

      if size <= 8 # can set a minimum sample size here
        return 60000
      else
        return avg
