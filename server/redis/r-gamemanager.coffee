Promise = require 'bluebird'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get("env")
ttl = config.get("redis.ttl")
generatePushID = require '../../app/common/generate_push_id'
zlib = Promise.promisifyAll(require 'zlib')

# Helper returns the Game Data Redis key prefix
keyPrefix = () ->
  return "#{env}:games:"

# Helper returns the Game Mouse/UI Event Data Redis key prefix
keyPrefixForMouseUIData = () ->
  return "#{env}:games_mouse_ui_data:"

###*
# Class 'RedisGameManager'
# Manages storage of games in Redis
# Serialized games are stored by incrementing id
# ttl sets the expiration time of keys, defaults to 72 hours
###
class RedisGameManager
  ###*
  # Constructor
  # @param {Object} redis, a promisified redis connection
  ###
  constructor: (redis, opts = {}) ->
    # TODO: add check to ensure Redis client is already promisified
    @redis = redis
    return

  ###*
  # Generate a unique id for the game using atomic increment
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  generateGameId: (callback) ->
    p =  new Promise (resolve,reject)->
      resolve(generatePushID())

    return p.nodeify(callback)

  ###*
  # Save *serialized* game session data to redis
  # @param {String} the game id to be used as the key
  # @param {Object} the game data *after* serializing
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  saveGameSession: (gameId, serializedGameData, callback) ->
    Logger.module("REDIS").debug "saveGameSession() -> saving GameSession #{gameId}"
    gameKey = keyPrefix() + gameId
    return zlib.gzipAsync(serializedGameData)
    .then (gzipGameData) =>
      # gzipGameData is a buffer
      multi = @redis.multi() # start a multi command
      multi.set(gameKey, gzipGameData)
      multi.expire(gameKey, ttl) # mark to expire at ttl
      return multi.execAsync()
    .nodeify(callback)

  ###*
  # Load *serialized* game session data from redis
  # @param {String} the game id to be used as the key
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  loadGameSession: (gameId, callback) ->
    Logger.module("REDIS").debug "loadGameSession() -> loading GameSession #{gameId}"
    gameKey = keyPrefix() + gameId
    # Must pass a new Buffer(key) to get back a buffer object
    return @redis.getAsync(new Buffer(gameKey))
    .then (buffer) ->
      if buffer
        return zlib.gunzipAsync(buffer)
      else
        # just return the empty buffer (null)
        return buffer
    .nodeify(callback)

  ###*
  # Save *serialized* game mouse and ui data to redis
  # @param {String} the game id to be used as the key
  # @param {Object} the data *after* serializing
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  saveGameMouseUIData: (gameId, serializedData, callback) ->
    Logger.module("REDIS").debug "saveGameMouseUIData() -> saving data for game #{gameId}"
    key = keyPrefixForMouseUIData() + gameId
    return zlib.gzipAsync(serializedData)
    .then (gzipMouseData) =>
      # gzipMouseData is a buffer
      multi = @redis.multi() # start a multi command
      multi.set(key, gzipMouseData)
      multi.expire(key, ttl) # mark to expire at ttl
      return multi.execAsync()
    .nodeify(callback)

  ###*
  # Load *serialized* game mouse and ui data from redis
  # @param {String} the game id to be used as the key
  # @param {Function|optional} callback
  # @return {Promise}
  ###
  loadGameMouseUIData: (gameId, callback) ->
    Logger.module("REDIS").debug "loadGameMouseUIData() -> loading data for game #{gameId}"
    key = keyPrefixForMouseUIData() + gameId
    return @redis.getAsync(new Buffer(key))
    .then (buffer) ->
      if buffer
        return zlib.gunzipAsync(buffer)
      else
        # just return the empty buffer (null)
        return buffer
    .nodeify(callback)

###*
# Export a factory
###
module.exports = exports = (redis, opts) ->
  GameManager  = new RedisGameManager(redis, opts)
  return GameManager
