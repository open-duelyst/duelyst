###
Job - Rotate Boss Battles
###
DuelystFirebase = require '../../server/lib/duelyst_firebase_module.coffee'
Logger = require '../../app/common/logger.coffee'
Cards = require '../../app/sdk/cards/cardsLookup.coffee'
moment = require 'moment'

# Collect valid boss IDs.
BossIds = Object.values(Cards.Boss)
BrokenBossIds = [200106] # These bosses are missing resources and cause login crashes.
BossIds = BossIds.filter (id) -> return BrokenBossIds.indexOf(id) == -1

oneDay = 24 * 60 * 60 * 1000 # Milliseconds.

###*
# Job - 'rotate-bosses'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  Logger.module("JOB").debug("[J:#{job.id}] rotate-bosses starting")

  # Get boss events from Firebase.
  DuelystFirebase.connect().getRootRef().then (rootRef) ->
    rootRef.child('boss-events').once('value').then((snapshot) ->
      currentBossEvents = snapshot.val()
      nextBossId = BossIds[0]
      now = moment().utc().valueOf()

      # Check for an active boss event.
      if currentBossEvents? and Object.keys(currentBossEvents).length > 0
        event = currentBossEvents[Object.keys(currentBossEvents)[0]]

        # If there is an active boss already, do nothing.
        if now < event["event_end"]
          Logger.module("JOB").log "rotate-bosses: boss event is already active"
          return done()

        # Determine the next boss ID.
        nextBossIndex = BossIds.indexOf(event["boss_id"])+1
        if nextBossIndex >= BossIds.length
          nextBossIndex = nextBossIndex - BossIds.length
        nextBossId = BossIds[nextBossIndex]

      # Create a new boss event.
      event =
        'boss-battle':
          event_id: "boss-battle"
          boss_id: nextBossId
          event_start: now
          event_end: now + oneDay
          valid_end: now + oneDay
      DuelystFirebase.connect().getRootRef().then (rootRef) ->
        rootRef.child('boss-events').set(event, (error) ->
          if error?
            Logger.module("JOB").error "rotate-bosses: error: #{error}"
            return done(error)
          Logger.module("JOB").log "rotate-bosses: started event for boss #{nextBossId}"
          return done()
        )
    )
  .catch (error) ->
    Logger.module("JOB").error "rotate-bosses: error: #{error}"
    return done(error)
