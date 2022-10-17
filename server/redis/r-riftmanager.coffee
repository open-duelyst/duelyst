Promise = require 'bluebird'
moment = require 'moment'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get("env")
ttl = config.get("redis.ttl")
generatePushID = require '../../app/common/generate_push_id'
zlib = Promise.promisifyAll(require 'zlib')

# Helper returns the SRank Ladder Redis key prefix
keyPrefix = () ->
  if not RedisRiftManager.unitTestMode
    return "#{env}:rift_ladder"
  else
    return "#{env}:rift_ladder:test"

expireAtTime = (systemTime) ->
  MOMENT_NOW_UTC = systemTime || moment().utc()
  if not RedisRiftManager.unitTestMode
    expireAtMoment = MOMENT_NOW_UTC.clone().add(2,"week")
    return expireAtMoment.valueOf()
  else
    return moment.utc().add(1,"hour").valueOf()


###*
# Class 'RedisRiftManager'
# Manages storage of rift ladder ratings/position in Redis
# ttl sets the expiration time of keys, defaults to 2 weeks
###
class RedisRiftManager

  @unitTestMode: false # This will change the way timeouts are handled so expires can more easily be tested

  ###*
  # Constructor
  # @param {Object} redis, a promisified redis connection
  ###
  constructor: (redis, opts = {}) ->
    @redis = redis
    return

  ###*
  # Updates the ladder rating of a player by user id and rift ticket id
  # @param {String} userId user id being updated
  # @param {String} ticketId run/ticket id being updated
  # @param {Integer} riftRating players new ladder rating
  # @return {Promise}
  ###
  updateUserRunRiftRating: (userId,ticketId, riftRating,systemTime) ->
    Logger.module("REDIS").debug "updateUserRunHighestRiftRating() -> updating Rift rating for player #{userId} run #{ticketId} to #{riftRating}"
    redisKey = keyPrefix()
    userRunKey = userId + ":" + ticketId
    multi = @redis.multi() # start a multi command
    multi.zadd(redisKey, riftRating, userRunKey)
    multi.expireat(redisKey, expireAtTime(systemTime))

    return multi.execAsync()

  ###*
  # Retrieves player's srank ladder position
  # @param {String} userId user id being updated
  # @param {String} ticketId run/ticket id being updated
  # @return {Promise} Resolves to a integer for players ladder position
  ###
  getUserRunLadderPosition: (userId,ticketId,systemTime) ->
    Logger.module("REDIS").debug "updateUserLadderRating() -> getting Ladder Position for user #{userId} run #{ticketId}"

    redisRiftKey = keyPrefix()
    userRunKey = userId + ":" + ticketId

    return @redis.zrevrankAsync(redisRiftKey, userRunKey)
    .then (ladderPosition) ->
      if ladderPosition?
        return Promise.resolve(parseInt(ladderPosition)+1)
      else
        return Promise.resolve(null)


  ###*
  # Gets top rift ladder player&run id tuples
  # @param {integer} numPlayers
  # @return {Promise} An array of "userId:runId" in order of top players
  ###
  getTopLadderUserIdAndRunIds: (numPlayers) ->
    Logger.module("REDIS").debug "getTopLadderUserIds() -> retrieving top #{numPlayers} rift players"

    redisKey = keyPrefix()

    return @redis.zrevrangeAsync(redisKey, 0, numPlayers-1)



  ###*
  # This method has no use in normal user flow, it's only purpose is QA and wiping a user
  # @param {String} userId user id being removed
  # @param {String} ticketId run id being removed
  # @return {Promise} Promise that returns on operation completion, no value
  ###
  _removeUserRunFromLadder: (userId,ticketId)  ->
    userRunKey = userId + ":" + ticketId
    Logger.module("REDIS").debug "updateUserLadderRating() -> getting Ladder Position for #{userRunKey}"

    redisKey = keyPrefix()

    return @redis.zremAsync(redisKey,userRunKey)



###*
# Export a factory
###
module.exports = exports = (redis, opts) ->
  RiftManager  = new RedisRiftManager(redis, opts)
  return RiftManager
