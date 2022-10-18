express = require 'express'
request = require 'superagent'
Promise = require 'bluebird'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger'
config = require '../../../../config/config'
t = require 'tcomb-validation'
UtilsGameSession = require '../../../../app/common/utils/utils_game_session.coffee'
GameSession = require '../../../../app/sdk/gameSession'
Errors = require '../../../lib/custom_errors'
generatePushId = require '../../../../app/common/generate_push_id'
_ = require("underscore")

awsRegion = config.get('aws.region')
awsReplaysBucket = config.get('aws.replaysBucketName')

router = express.Router()

router.get "/:replay_id", (req, res, next) ->
  result = t.validate(req.params.replay_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  replay_id = result.value

  knex("user_replays").where('replay_id',replay_id).first()
  .bind {}
  .then (replayData)->
    @.replayData = replayData
    if replayData?
      game_id = replayData.game_id
      gameDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/#{game_id}.json"
      mouseUIDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/ui_events/#{game_id}.json"
      Logger.module("API").debug "starting download of game #{game_id} replay data from #{gameDataUrl}"

      downloadGameSessionDataAsync = new Promise (resolve,reject)->
        request.get(gameDataUrl).end (err, res) ->
          if res? && res.status >= 400
            # Network failure, we should probably return a more intuitive error object
            Logger.module("API").error "ERROR! Failed to connect to games data: #{res.status} ".red
            return reject(new Error("Failed to connect to games data."))
          else if err
            # Internal failure
            Logger.module("API").error "ERROR! _retrieveGameSessionData() failed: #{err.message} ".red
            return reject(err)
          else
            return resolve(res.text)

      downloadMouseUIDataAsync = new Promise (resolve,reject)->
        request.get(mouseUIDataUrl).end (err, res) ->
          if res? && res.status >= 400
            # Network failure, we should probably return a more intuitive error object
            Logger.module("API").error "ERROR! Failed to connect to ui event data: #{res.status} ".red
            return reject(new Error("Failed to connect to ui event data."))
          else if err
            # Internal failure
            Logger.module("API").error "ERROR! _retrieveGameUIEventData() failed: #{err.message} ".red
            return reject(err)
          else
            return resolve(res.text)

      return Promise.all([
        downloadGameSessionDataAsync,
        downloadMouseUIDataAsync
      ])
    else
      return [null,null]
  .spread (gameDataString,mouseUIDataString)->
    Logger.module("API").debug "downloaded replay id: #{replay_id} data. size:#{gameDataString?.length || 0}"
    if not gameDataString? or not mouseUIDataString?
      res.status(404).json({})
    else
      gameSessionData = JSON.parse(gameDataString)
      mouseUIData = JSON.parse(mouseUIDataString)

      # scrub the data here
      gameSession = GameSession.create()
      gameSession.deserializeSessionFromFirebase(JSON.parse(gameDataString))
      Logger.module("API").debug "scrubbing replay from perspective of #{@.replayData.user_id}"
      gameSessionData = UtilsGameSession.scrubGameSessionData(gameSession,gameSessionData,@.replayData.user_id,true)

      res.status(200).json({
        gameSessionData: gameSessionData,
        mouseUIData: mouseUIData,
        replayData: @.replayData
      })
      
  .catch (error) -> next(error)

module.exports = router
