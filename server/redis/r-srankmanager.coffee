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
  if not RedisSRankManager.unitTestMode
    return "#{env}:s_rank_ladder:"
  else
    return "#{env}:s_rank_ladder:test:"

seasonKey = (seasonStartMoment) ->
  return seasonStartMoment.format("YYYY_MM")

expireAtTimeForSeasonStart = (seasonStartMoment) ->
  if not RedisSRankManager.unitTestMode
    startOfNextSeasonMoment = seasonStartMoment.clone().add(1,"month")
    # add a single day for overlap
    startOfNextSeasonMoment.add(1,"day")
    return startOfNextSeasonMoment.valueOf()
  else
    return moment.utc().add(1,"hour").valueOf()


###*
# Class 'RedisSRankManager'
# Manages storage of srank ladder ratings/position in Redis
# ttl sets the expiration time of keys, defaults to 72 hours
###
class RedisSRankManager

  @unitTestMode: false # This will change the way timeouts are handled so different seasons can be unit tested

  ###*
  # Constructor
  # @param {Object} redis, a promisified redis connection
  ###
  constructor: (redis, opts = {}) ->
    @redis = redis
    return

  ###*
  # Updates the ladder rating of a player by user id
  # @param {String} userId user id being updated
  # @param {Moment} seasonStartMoment moment representing the start of the month of the season
  # @param {Integer} ladderRating players new ladder rating
  # @return {Promise}
  ###
  updateUserLadderRating: (userId,seasonStartMoment, ladderRating) ->
    Logger.module("REDIS").debug "updateUserLadderRating() -> updating Ladder Rating for player #{userId} to #{ladderRating}"
    redisSeasonKey = keyPrefix() + seasonKey(seasonStartMoment)
    multi = @redis.multi() # start a multi command
    multi.zadd(redisSeasonKey, ladderRating, userId)
    multi.expireat(redisSeasonKey, expireAtTimeForSeasonStart(seasonStartMoment))

    return multi.execAsync()

  ###*
  # Retrieves player's srank ladder position
  # @param {String} userId user id being updated
  # @param {Moment} seasonStartMoment moment representing the start of the month of the season
  # @return {Promise} Resolves to a integer for players ladder position
  ###
  getUserLadderPosition: (userId,seasonStartMoment) ->
    Logger.module("REDIS").debug "updateUserLadderRating() -> getting Ladder Position for #{userId}"

    redisSeasonKey = keyPrefix() + seasonKey(seasonStartMoment)

    return @redis.zrevrankAsync(redisSeasonKey, userId)
    .then (ladderPosition) ->
      if ladderPosition?
        return Promise.resolve(parseInt(ladderPosition)+1)
      else
        return Promise.resolve(null)


  ###*
  # Gets top srank ladder player ids
  # @param {moment} seasonStartMoment moment for the start of season being retrieved
  # @param {integer} numPlayers
  # @return {Promise} An array of user ids in order of top players
  ###
  getTopLadderUserIds: (seasonStartMoment, numPlayers) ->
    Logger.module("REDIS").debug "getTopLadderUserIds() -> retrieving top #{numPlayers} s-rank players for season #{seasonKey(seasonStartMoment)}"

    redisSeasonKey = keyPrefix() + seasonKey(seasonStartMoment)

    return @redis.zrevrangeAsync(redisSeasonKey, 0, numPlayers-1)

  ###*
  # Synchronous - Returns true/false whethere a season's ratings can still be found in Redis
  # @param {moment} seasonStartMoment moment for the start of season being retrieved
  # @param {moment} systemTime current time of the system
  # @return {boolean} Whether provided season's data is active in Redis
  ###
  getSeasonIsStillActiveInRedis: (seasonStartMoment, systemTime) ->
    seasonExpireMoment = moment.utc(expireAtTimeForSeasonStart(seasonStartMoment))
    return seasonExpireMoment.isAfter(systemTime)



  ###*
  # This method has no use in normal user flow, it's only purpose is QA and wiping a user
  # @param {String} userId user id being removed
  # @param {Moment} seasonStartMoment moment representing the start of the month of the season
  # @return {Promise} Promise that returns on operation completion, no value
  ###
  _removeUserFromLadder: (userId, seasonStartMoment)  ->
    Logger.module("REDIS").debug "updateUserLadderRating() -> getting Ladder Position for #{userId}"

    redisSeasonKey = keyPrefix() + seasonKey(seasonStartMoment)

    return @redis.zremAsync(redisSeasonKey,userId)



###*
# Export a factory
###
module.exports = exports = (redis, opts) ->
  SRankManager  = new RedisSRankManager(redis, opts)
  return SRankManager
