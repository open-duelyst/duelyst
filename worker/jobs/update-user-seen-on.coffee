###
Job - Update User Seen On
###
config = require '../../config/config.js'
Logger = require '../../app/common/logger.coffee'
UsersModule = require '../../server/lib/data_access/users.coffee'
Promise = require 'bluebird'
moment = require 'moment'


###*
# Job - 'update-user-seen-on'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  userId = job.data.userId || null
  userSeenOn = job.data.userSeenOn || null

  if !userId
    return done(new Error("update-user-seen-on: User ID is not defined."))

  if !userSeenOn
    return done(new Error("update-user-seen-on: User seenOn is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Seen On starting")
  Logger.module("JOB").time("[J:#{job.id}] Update User (#{userId}) Seen On")

  return UsersModule.updateDaysSeen(userId,moment.utc(userSeenOn))
  .then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Seen On")
    return done()
  .catch (error) ->
    return done(error)
