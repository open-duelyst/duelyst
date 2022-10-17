###
Job - Update User Ranking
###
config = require '../../config/config.js'
RankModule = require '../../server/lib/data_access/rank'
Logger = require '../../app/common/logger.coffee'

# TODO: Can this be removed?

###*
# Job - 'update-user-ranking'
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

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Ranking for game #{gameId} starting")

  RankModule.updateUserRankingWithGameOutcome(userId,isWinner,gameId,isDraw)
  .then () ->
    Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Ranking for game #{gameId} done()")
    return done()
  .catch (error) ->
    return done(error)
