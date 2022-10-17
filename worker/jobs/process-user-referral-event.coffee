###
Job - Update User Ranking
###
config = require '../../config/config.js'
ReferralsModule = require '../../server/lib/data_access/referrals'
Logger = require '../../app/common/logger.coffee'

###*
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  userId = job.data.userId || null
  referrerId = job.data.referrerId || null
  eventType = job.data.eventType || null

  if !userId
    return done(new Error("User ID is not defined."))
  if !referrerId
    return done(new Error("referrerId is not defined."))
  if !eventType
    return done(new Error("eventType is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] User (#{userId}) generated referral event \"#{eventType}\" for code \"#{referrerId}\" ... starting")
  Logger.module("JOB").time("[J:#{job.id}] User (#{userId}) generated referral event \"#{eventType}\" for code \"#{referrerId}\"")

  ReferralsModule.processReferralEventForUser(userId,referrerId,eventType)
  .then () ->
    Logger.module("JOB").timeEnd("[J:#{job.id}] User (#{userId}) generated referral event \"#{eventType}\" for code \"#{referrerId}\"")
    return done()
  .catch (error) ->
    return done(error)
