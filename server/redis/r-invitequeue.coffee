_ = require 'underscore'
Promise = require 'bluebird'
crypto = require 'crypto'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get("env")

# Helper returns the Redis key prefix
keyPrefix = () ->
  return "#{env}:matchmaking:"

###*
# Class 'RedisInviteQueue'
# Manages invites in Redis in a list structure
# New list is created for each inviteId
###
module.exports = class RedisInviteQueue
  ###*
  # Constructor
  # Gives itself a random name if none specified
  # @param {Object} redis, a promisified redis connection
  # @param {Object} options, opts.name sets the queue's name
  ###
  constructor: (redis) ->
    # TODO: add check to ensure Redis client is already promisified
    @redis = redis
    @list = keyPrefix() + "invites"
    return

  ###*
  # Add player to an invite list
  # @param {String} playerId
  # @param {String} inviteId
  # @return {Promise} length of the list
  ###
  add: (playerId,inviteId) ->
    # Logger.module("REDIS-INVITE").log("add(#{playerId}, #{inviteId})")
    inviteKey = @list + ":#{inviteId}"
    return @redis.lpushAsync(inviteKey, playerId)

  ###*
  # Delete an invite list
  # @param {String} inviteId
  # @return {Promise} true or false if deleted
  ###
  clear: (inviteId) ->
    # Logger.module("REDIS-INVITE").log("clear(#{inviteId})")
    inviteKey = @list + ":#{inviteId}"
    return @redis.delAsync(inviteKey)

  ###*
  # Return the number of players in the invite
  # @return {Promise} number of players
  ###
  count: (inviteId) ->
    # Logger.module("REDIS-INVITE").log("count(#{inviteId})")
    inviteKey = @list + ":#{inviteId}"
    return @redis.llenAsync(inviteKey)

  ###*
  # Return the list of players in the invite
  # @param {String} inviteId
  # @return {Promise} array of player ids
  ###
  grab: (inviteId) ->
    # Logger.module("REDIS-INVITE").log("grab(#{inviteId})")
    inviteKey = @list + ":#{inviteId}"
    return @redis.lrangeAsync(inviteKey, 0, -1)

###*
# Export a factory
###
module.exports = exports = (redis) ->
  InviteQueue  = new RedisInviteQueue(redis)
  return InviteQueue
