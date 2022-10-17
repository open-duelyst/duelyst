###
Job - Update User Ranking
###
config = require '../../config/config.js'
SyncModule = require '../../server/lib/data_access/sync'
Logger = require '../../app/common/logger.coffee'

###*
# Job to sync user's buddy list to SQL.
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  # disable this job early
  return done()
  
  userId = job.data.userId || null
  if !userId
    return done(new Error("User ID is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] sync user (#{userId}) buddy list starting")
  Logger.module("JOB").time("[J:#{job.id}] synced user (#{userId}) buddy list")

  SyncModule.syncBuddyListFromFirebaseToSQL(userId)
  .then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] synced user (#{userId}) buddy list")
    return done()
  .catch (error) ->
    return done(error)
