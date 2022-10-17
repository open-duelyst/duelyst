###
Job - Update User Stats
###
config = require '../../config/config.js'
UsersModule = require '../../server/lib/data_access/users'
Logger = require '../../app/common/logger.coffee'
{GameManager} = require '../../server/redis/'

###*
# Job - 'update-user-stats'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  userId = job.data.userId || null
  gameType = job.data.gameType

  if !gameId
    return done(new Error("Game ID is not defined."))
  if !userId
    return done(new Error("User ID is not defined."))
  if !gameType
    return done(new Error("Game type is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Stats for game #{gameId} starting")
  Logger.module("JOB").time("[J:#{job.id}] Update User (#{userId}) Stats for game #{gameId}")

  GameManager.loadGameSession(gameId)
  .then JSON.parse
  .then (gameSessionData) ->
    if !gameSessionData
      throw new Error("Game data is null. Game may have already been archived.")
    else
      UsersModule.updateUserStatsWithGame(userId,gameId,gameType,gameSessionData)
  .then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Stats for game #{gameId}")
    return done()
  .catch (error) ->
    return done(error)
