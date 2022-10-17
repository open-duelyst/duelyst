###
Job - Archive Game
###
GamesModule = require '../../server/lib/data_access/games.coffee'
uploadGameToS3 = require '../upload_game_to_s3'
config = require '../../config/config.js'
env = config.get('env')
{GameManager} = require '../../server/redis/'
Promise = require 'bluebird'
Logger = require '../../app/common/logger.coffee'

###*
# Job - 'archive-game'
# Uploads serialized game data from Redis to S3 as JSON file
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  if !gameId
    return done(new Error("Game ID is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] archive-game -> (#{gameId}) starting")

  Promise.all([
    GameManager.loadGameSession(gameId)
    GameManager.loadGameMouseUIData(gameId)
  ])
  .bind {}
  .spread (serializedGameData,serializedMouseAndUIEventData) ->
    @.serializedGameData = serializedGameData
    if !serializedGameData
      throw new Error("Game data is null. Game may have already been archived.")
    else
      if not serializedMouseAndUIEventData?
        Logger.module("JOB").warn("[J:#{job.id}] archive-game -> WARNING: mouse data not present for game:#{gameId}")
      return uploadGameToS3(gameId, serializedGameData, serializedMouseAndUIEventData)
  .then (url) ->
    @.url = url
    Logger.module("JOB").debug("[J:#{job.id}] archive-game -> (#{gameId}) uploaded to #{url}.")
    Logger.module("JOB").debug("[J:#{job.id}] archive-game -> (#{gameId}) saving game metadata.")
    return GamesModule.saveGameMetadata(gameId,JSON.parse(@.serializedGameData),url)
  .then () ->
    Logger.module("JOB").debug("[J:#{job.id}] archive-game -> (#{gameId}) DONE. - #{@.url}")
    return done()
  .catch (error) ->
    return done(error)
