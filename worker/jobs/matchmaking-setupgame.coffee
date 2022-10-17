###
Job - Setup Match
###
Promise = require 'bluebird'
getGameServerAsync = require '../get_gameserver.coffee'
createGameAsync = require '../creategame.coffee'
DuelystFirebaseModule = require '../../server/lib/duelyst_firebase_module.coffee'
FirebasePromises = require '../../server/lib/firebase_promises.coffee'
Logger = require '../../app/common/logger.coffee'

###*
# Job - 'matchmaking-setupmatch'
# TODO : convert to pull player token directly via Redis instead of being passed in
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  token1 = job.data.token1 || null
  token2 = job.data.token2 || null
  gameType = job.data.gameType

  if !token1
    return done(new Error("Token 1 is not defined."))
  if !token2
    return done(new Error("Token 2 is not defined."))
  if !gameType
    return done(new Error("gameType is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] setup #{gameType.yellow} game (#{token1.name} versus #{token2.name}) starting")

  getGameServerAsync()
  .bind {}
  .then (gameServer) ->
    @.gameServer = gameServer
    if !gameServer
      job.log("Not assigning to specific server.")
    else
      job.log("Assigned to %s", gameServer)
    return createGameAsync(gameType, token1, token2, gameServer) #tag creategame() for easier search
  .then (gameId) ->
    Logger.module("JOB").debug("[J:#{job.id}] Setup #{gameType.toUpperCase()} Game ID:#{gameId} SERVER:#{@.gameServer} (#{token1.name} versus #{token2.name}) done()")
    return done(null, {gameId: gameId})
  .catch (error) ->
    # Note we are leaking a 'unsanitized' error message here
    # write failed message to both players firebases
    DuelystFirebaseModule.connect().getRootRef()
    .then (rootRef) ->
      return Promise.all([
        FirebasePromises.set( rootRef.child("user-matchmaking-errors/#{token1.userId}/#{token1.id}"), error.message ),
        FirebasePromises.set( rootRef.child("user-matchmaking-errors/#{token2.userId}/#{token2.id}"), error.message )
      ])
    .finally () ->
      # Mark job as failed
      done(error)
