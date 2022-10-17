###
Job - Update User Ranking
###
config = require '../../config/config.js'
GauntletModule = require '../../server/lib/data_access/gauntlet'
Logger = require '../../app/common/logger.coffee'

###*
# Job - 'update-user-arena-run'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  userId = job.data.userId || null
  isWinner = job.data.isWinner
  isDraw = job.data.isDraw

  if !gameId
    return done(new Error("Game ID is not defined."))
  if !userId
    return done(new Error("User ID is not defined."))
  if isWinner == undefined
    return done(new Error("isWinner is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Arena Run for game #{gameId} starting")
  Logger.module("JOB").time("[J:#{job.id}] Update User (#{userId}) Arena Run for game #{gameId}")

  GauntletModule.updateArenaRunWithGameOutcome(userId,isWinner,gameId,isDraw)
  .then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Arena Run for game #{gameId}")
    return done()
  .catch (error) ->
    return done(error)
