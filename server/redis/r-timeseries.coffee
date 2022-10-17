_ = require 'underscore'
Promise = require 'bluebird'
moment = require 'moment'
crypto = require 'crypto'
config = require '../../config/config.js'
Logger = require '../../app/common/logger.coffee'
env = config.get("env")

# Helper returns the Redis key prefix
keyPrefix = () ->
  return "#{env}:ts:"

# Helper returns a random string of specified length
randomString = (length) ->
  crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length)

# Helper returns a random key
randomKey = () ->
  randomString(8)

# Helper returns a random value
randomValue = () ->
  randomString(32)

# Defaults used in constructor
defaults =
  name: randomKey()

###*
# Class 'RedisTimeSeries'
# Manages time series data structure in Redis
# Time series are sorted sets, sorted by a UTC timestamp
# Since values must be unique, we also prefix the value w/ the timestamp
###
module.exports = class RedisTimeSeries
  ###*
  # Constructor
  # Gives itself a random name if none specified
  # @param {Object} redis, a promisified redis connection
  # @param {Object} options, opts.name sets the time series' name
  ###
  constructor: (redis, opts = {}) ->
    # TODO: add check to ensure Redis client is already promisified
    @redis = redis
    @name = opts.name || defaults.name
    @ts = keyPrefix() + @name
    @createdAt = moment.utc().valueOf()

    # Logger.module("REDIS").log("ts(#{@name})")
    return

  ###*
  # Mark a hit in the time series
  # Will use a random value if none specified
  # Note this may cause collisions if random string is short
  # Deletes / prunes hits that are older than 72 hours on insert
  # @param {String} unique value to assosicate with hit
  # @return {Promise} returns 1 if success, 0 if fail
  ###
  hit: (value = randomValue()) ->
    # Logger.module("REDIS-TS").log("hit(#{value})")

    timestamp = moment.utc().valueOf()
    score = timestamp
    # we add a timestamp to the value also to ensure some uniqueness
    # as you cannot have duplicate values in a sorted set
    value = timestamp + ":" + value
    # prune data older than 72 hours, TODO: make this configurable
    old = moment.utc().subtract(72,'hours').valueOf()

    # delete + insert
    multi = @redis.multi()
    multi.zremrangebyscore(@ts, 0, old)
    multi.zadd(@ts, score, value)
    return multi.execAsync()

  ###*
  # Query the time series
  # @param {Object} options
  # @return {Promise} returns object contain all hits in query range
  # opts.range, hours to query the time series, defaults to 1hr
  # opts.limit, limit the number of results, defaults to 1000
  # opts.withScores, include the scores, defaults to true
  ###
  query: (opts = {}) ->
    range = opts.range || 1
    limit = opts.limit || 1000
    withScores = opts.withScores || true

    # Logger.module("REDIS-TS").log("query(#{range})")

    now = moment.utc().valueOf()
    previous = moment.utc().subtract(range,'hours').valueOf()

    if withScores
      args = [ @ts, previous, now, 'WITHSCORES', 'LIMIT', 0, limit ]
    else
      # TODO : fix without scores option
      args = [ @ts, previous, now, 'WITHSCORES', 'LIMIT', 0, limit ]
    @redis.zrangebyscoreAsync(args)
    .then (scores) ->
      # TODO : this only works WITHSCORES = true
      values = []
      # scores is an array [] where even/odd pairs are the value, score
      # zip up the array into an object keyed by score
      while scores.length > 0
        value = scores.shift()
        score = scores.shift()
        # remove the timestamp added to the value
        values.push(value.split(':')[1])
      return values

  ###*
  # Query the time series
  # @param {Integer} range, number of hours to query back
  # @return {Promise} number of hits in time series query
  ###
  countHits: (range = 1) ->
    return @query({range: range}).then(_).call('size')
