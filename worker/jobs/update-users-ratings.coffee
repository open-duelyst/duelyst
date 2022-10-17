###
Job - Update two Users Ratings after playing a Rank 0 match
###
config = require '../../config/config.js'
RankModule = require '../../server/lib/data_access/rank'
Logger = require '../../app/common/logger.coffee'

###*
# Job - 'update-users-ratings'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  player1UserId = job.data.player1UserId || null
  player1IsRanked = job.data.player1IsRanked || false
  player2UserId = job.data.player2UserId || null
  player2IsRanked = job.data.player2IsRanked || false
  player1IsWinner = job.data.player1IsWinner
  isDraw = job.data.isDraw

  if !gameId
    return done(new Error("Game ID is not defined."))
  if !player1UserId
    return done(new Error("Player 1 User ID is not defined."))
  if !player2UserId
    return done(new Error("Player 2 User ID is not defined."))
  if !player1IsWinner?
    return done(new Error("player1IsWinner is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update Users [#{player1UserId},#{player2UserId}] Ratings for game #{gameId} starting")

  RankModule.updateUsersRatingsWithGameOutcome(player1UserId,player2UserId,player1IsWinner,gameId,isDraw,player1IsRanked,player2IsRanked)
  .then () ->
    Logger.module("JOB").debug("[J:#{job.id}] Update Users [#{player1UserId},#{player2UserId}] Ratings for game #{gameId} done()")
    return done()
  .catch (error) ->
    return done(error)
