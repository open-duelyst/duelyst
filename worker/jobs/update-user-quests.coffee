###
Job - Update User Ranking
###
config = require '../../config/config.js'
QuestsModule = require '../../server/lib/data_access/quests'
Logger = require '../../app/common/logger.coffee'
{GameManager} = require '../../server/redis/'

###*
# Job - 'update-user-quests'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  userId = job.data.userId || null

  if !gameId
    return done(new Error("Game ID is not defined."))
  if !userId
    return done(new Error("User ID is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Quests for game #{gameId} starting")
  Logger.module("JOB").time("[J:#{job.id}] Update User (#{userId}) Quests for game #{gameId}")

  GameManager.loadGameSession(gameId)
  .then JSON.parse
  .then (gameSessionData) ->
    if !gameSessionData
      throw new Error("Game data is null. Game may have already been archived.")
    else
      QuestsModule.updateQuestProgressWithGame(userId,gameId,gameSessionData)
  .then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Quests for game #{gameId}")
    return done()
  .catch (error) ->
    return done(error)
