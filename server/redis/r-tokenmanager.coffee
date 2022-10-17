_ = require 'underscore'
Promise = require 'bluebird'
moment = require 'moment'
crypto = require 'crypto'
uuid = require 'node-uuid'
warlock = require '@counterplay/warlock'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
GameType = require '../../app/sdk/gameType.coffee'
env = config.get("env")

# Returns the Redis key prefix used
keyPrefix = () ->
  return "#{env}:matchmaking:tokens"

###*
# Generate a 'matchmaking' token id
# id is returned the client for listening to errors on (via Firebase)
# @return {String} url safe token id
###
createTokenId = () ->
  id = new Buffer(uuid.v4()).toString('base64')
  id.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, "")

  return id

###*
# Class 'RedisTokenManager'
# Manages player 'matchmaking' tokens in Redis
# Each player has only a single token in existance at any given time
# Tokens are stored as hashes (objects) in Redis
###
class RedisTokenManager
  ###*
  # Constructor
  # @param {Object} redis, a promisified redis connection
  ###
  constructor: (redis) ->
    # TODO: add check to ensure Redis client is already promisified
    @redis = redis
    @locker = Promise.promisifyAll(warlock(redis))
    return

  ###*
  # Generate a 'matchmaking' token object which will be stored in redis
  # We can set some defaults here or add extra stuff
  # @param {Object} options
  # @return {Object} matchmaking token object
  ###
  create: (opts = {}) ->
    token = {}
    token.id = createTokenId()
    token.createdAt = Date.now()
    token.userId = opts.userId
    token.name = opts.name
    token.rank = opts.rank
    token.deck = opts.deck
    token.factionId = opts.factionId
    token.gameType = opts.gameType or GameType.Ranked
    token.inviteId = opts.inviteId or null
    token.cardBackId = opts.cardBackId or null
    token.deckValue = opts.deckValue or 0
    token.lastOpponentId = opts.lastOpponentId or null
    token.ticketId = opts.ticketId or null
    if opts.battleMapIndexes
      token.battleMapIndexes = opts.battleMapIndexes
    token.riftRating = opts.riftRating or null
    return token

  ###*
  # Save the token to Redis
  # We can set some defaults here or add extra stuff
  # @param {Object} token
  # @return {Promise} Redis 'OK'
  ###
  add: (token) ->
    playerId = token.userId
    tokenKey = keyPrefix() + playerId
    if token.deck? then token.deck = JSON.stringify(token.deck)
    if token.battleMapIndexes? then token.battleMapIndexes = JSON.stringify(token.battleMapIndexes)
    return @redis.hmsetAsync(tokenKey, token)

  ###*
  # Remove the token or tokens from Redis in single op
  # @param {String|Array} playerId or array of playerIds
  # @return {Promise} number of elements removed
  ###
  remove: (playerIds) ->
    args = []
    if _.isArray(playerIds)
      _.each playerIds, (playerId) ->
        tokenKey = keyPrefix() + playerId
        args.push(tokenKey)
    else
      tokenKey = keyPrefix() + playerIds
      args.push(tokenKey)
    return @redis.delAsync(args)

  ###*
  # Does the player have a token
  # ie. they are waiting for a game (queue or friendly)
  # @param {String} playerId
  # @return {Promise} true or false
  ###
  exists: (playerId) ->
    tokenKey = keyPrefix() + playerId
    return @redis.existsAsync(tokenKey)

  ###*
  # Get the token object from Redis
  # @param {String} playerId
  # @return {Promise} token object
  ###
  get: (playerId) ->
    tokenKey = keyPrefix() + playerId
    @redis.hgetallAsync(tokenKey) # return entire token object
    .then (token) ->
      # TODO: There might be other data that we want to convert to correct format here
      if token?
        if token.deck?
          token.deck = JSON.parse(token.deck)
        if token.battleMapIndexes?
          token.battleMapIndexes = JSON.parse(token.battleMapIndexes)
        return token
      else
        return null

  ###*
  # Get the token's id from Redis
  # @param {String} playerId
  # @return {Promise} token id
  ###
  getId: (playerId) ->
    tokenKey = keyPrefix() + playerId
    return @redis.hgetAsync(tokenKey,"id") # return token id only

  ###*
  # Get the token's parameter (deck, rank, etc) from Redis
  # @param {String} playerId
  # @param {String} the parameter we want to retrieve
  # @return {Promise} token id
  ###
  getParameter: (playerId, param) ->
    tokenKey = keyPrefix() + playerId
    return @redis.hgetAsync(tokenKey,param) # return specified token param only

  ###*
  # Lock the player's token to signal it is in use
  # @param {String} playerId
  # @param {Integer} ttl (in seconds) on the lock
  # @return {Promise} unlock function if lock acquired
  ###
  lock: (playerId, ttl = 5000) ->
    return @locker.lockAsync(playerId, ttl)

  ###*
  # Check if a player's token is locked
  # @param {String} playerId
  # @return {Promise} bool if lock is set
  ###
  isLocked: (playerId) ->
    return @locker.isLockedAsync(playerId)

###*
# Export a factory
###
module.exports = exports = (redis, opts) ->
  TokenManager  = new RedisTokenManager(redis, opts)
  return TokenManager
