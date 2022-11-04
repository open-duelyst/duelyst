fs = require 'fs'
os = require 'os'
Logger = require '../app/common/logger.coffee'
config = require '../config/config.js'
Promise = require 'bluebird'
{ Jobs } = require '../server/redis'

if config.isDevelopment()
  Logger.module("WORKER").log "DEV MODE: enabling long stack support"
  process.env.BLUEBIRD_DEBUG = 1
  Promise.longStackTraces()

# Increase the number of event listeners in Node.js.
# Raising this suppresses benign warnings without losing leak detection.
events = require 'events'
events.EventEmitter.defaultMaxListeners = 20 # Default is 10.

###
Job Queue Consumer // aka Worker
###
kue = require 'kue'

###
Setup Kue connection
prefix namespaces the queue
###
worker = require '../server/redis/r-jobs'

# job failed
worker.on "job failed", (id, errorMessage) ->
  Logger.module("WORKER").error "[J:#{id}] has failed: #{errorMessage}".red
  kue.Job.get id, (err, job) ->
    if err then return

###
Kue Shutdown Event
Finishes current job, 10s timeout before shutting down.
###
cleanShutdown = () ->
  worker.shutdown 10000, (err) ->
    if err
      Logger.module("WORKER").error "Shutdown error occured: #{err.message}"
    Logger.module("WORKER").log "Shutting down."
    process.exit(0)

process.on "SIGTERM", cleanShutdown
process.on "SIGINT", cleanShutdown
process.on "SIGHUP", cleanShutdown
process.on "SIGQUIT", cleanShutdown
process.on "SIGABRT", cleanShutdown

###
Setup Jobs
###
archiveGame = require './jobs/archive-game.coffee'
updateUserPostGame = require './jobs/update-user-post-game.coffee'
updateUserAchievements = require './jobs/update-user-achievements.coffee'
updateUserChargeLog = require './jobs/update-user-charge-log.coffee'
matchmakingSetupGame = require './jobs/matchmaking-setupgame.coffee'
matchmakingSearchRanked = require './jobs/matchmaking-search-ranked.coffee'
matchmakingSearchCasual = require './jobs/matchmaking-search-casual.coffee'
matchmakingSearchArena = require './jobs/matchmaking-search-arena.coffee'
matchmakingSearchRift = require './jobs/matchmaking-search-rift.coffee'
dataSyncUserBuddyList = require './jobs/data-sync-user-buddy-list.coffee'
processUserReferralEvent = require './jobs/process-user-referral-event.coffee'
updateUsersRatings = require './jobs/update-users-ratings.coffee'
updateUserSeenOn = require './jobs/update-user-seen-on.coffee'
rotateBosses = require './jobs/rotate-bosses.coffee'

worker.process('archive-game', 1, archiveGame)
worker.process('update-user-post-game', 2, updateUserPostGame)
worker.process('update-user-achievements', 1, updateUserAchievements)
worker.process('update-user-charge-log', 1, updateUserChargeLog)
worker.process('matchmaking-setup-game', 1, matchmakingSetupGame)
worker.process('matchmaking-search-ranked', 1, matchmakingSearchRanked)
worker.process('matchmaking-search-casual', 1, matchmakingSearchCasual)
worker.process('matchmaking-search-arena', 1, matchmakingSearchArena)
worker.process('matchmaking-search-rift', 1, matchmakingSearchRift)
worker.process('data-sync-user-buddy-list', 1, dataSyncUserBuddyList)
worker.process('process-user-referral-event', 1, processUserReferralEvent)
worker.process('update-users-ratings', 1, updateUsersRatings)
worker.process('update-user-seen-on', 1, updateUserSeenOn)

# Run the rotateBosses job once on startup.
# TODO: Find another way to trigger this hourly.
worker.process('rotate-bosses', 1, rotateBosses)
runRotateBossesJob = () ->
  Jobs.create('rotate-bosses',
    name: 'Rotate Bosses'
    title: 'Rotating Boss Event'
  ).removeOnComplete(true).save()
setTimeout(runRotateBossesJob, 1000)
