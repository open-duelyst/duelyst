###
Job - Update User Progression
###
config = require '../../config/config.js'
UsersModule = require '../../server/lib/data_access/users'
Logger = require '../../app/common/logger.coffee'
Promise = require 'bluebird'
colors = require 'colors'

###*
# Job - 'update-user-game-counters'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  userId = job.data.userId || null
  factionId = job.data.factionId || null
  isWinner = job.data.isWinner
  isDraw = job.data.isDraw
  isUnscored = job.data.isUnscored || false
  gameType = job.data.gameType

  if !gameId
    return done(new Error("Game ID is not defined."))
  if !userId
    return done(new Error("User ID is not defined."))
  if !factionId
    return done(new Error("factionId is not defined."))
  if isWinner == undefined
    return done(new Error("isWinner is not defined."))
  if !gameType
    return done(new Error("Game type is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Game Counters for game #{gameId}. UNSCORED: #{isUnscored} starting")
  Logger.module("JOB").time("[J:#{job.id}] Update User (#{userId}) Game Counters for game #{gameId}. UNSCORED: #{isUnscored}")

  Promise.all([
    UsersModule.updateGameCounters(userId,factionId,isWinner,gameType,isUnscored,isDraw),
  ]).then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Game Counters for game #{gameId}. UNSCORED: #{isUnscored}")
    return done()
  .catch (error) ->
    return done(error)
