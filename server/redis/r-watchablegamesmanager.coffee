Promise = require 'bluebird'
moment = require 'moment'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get("env")
generatePushID = require '../../app/common/generate_push_id'

# Helper returns the Game Data Redis key prefix
keyPrefix = () ->
  return "#{env}:watchable_games:"

###*
# Class 'RedisWatchableGamesManager'
# Manages storage of games in Redis
# Serialized games are stored by incrementing id
# ttl sets the expiration time of keys, defaults to 72 hours
###
class RedisWatchableGamesManager
  ###*
  # Constructor
  # @param {Object} redis, a promisified redis connection
  ###
  constructor: (redis, opts = {}) ->
    # TODO: add check to ensure Redis client is already promisified
    @redis = redis
    return

  ###*
  # Save json watchable game data to redis
  # @param {String} the divison name for which to save/generate
  # @param {Object} the json data
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  saveGamesDataForDivision: (divisionName, dataJson, callback) ->
    divisionName = divisionName.toLowerCase()
    dateKey = moment.utc().startOf('day').format("YYYY-MM-DD")
    key = keyPrefix() + "#{divisionName}:#{dateKey}"
    Logger.module("REDIS").debug "saveGamesDataForDivision() -> saving watchable game data for #{divisionName}"

    multi = @redis.multi() # start a multi command
    multi.set(key, dataJson)
    multi.expire(key, config.get('watchSectionCacheTTL')) # when to expire the cache

    return multi.execAsync()
    .nodeify(callback)

  ###*
  # Load json watchable game data from redis
  # @param {String} the divison name for which to load
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  loadGamesDataForDivision: (divisionName, callback) ->
    divisionName = divisionName.toLowerCase()
    dateKey = moment.utc().startOf('day').format("YYYY-MM-DD")
    key = keyPrefix() + "#{divisionName}:#{dateKey}"
    Logger.module("REDIS").debug "loadGamesDataForDivision() -> #{divisionName}"

    @redis.getAsync(key)
    .then JSON.parse
    .nodeify(callback)

###*
# Export a factory
###
module.exports = exports = (redis, opts) ->
  RedisWatchableGamesManager = new RedisWatchableGamesManager(redis, opts)
  return RedisWatchableGamesManager
