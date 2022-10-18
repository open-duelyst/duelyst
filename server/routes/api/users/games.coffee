express = require 'express'
request = require 'superagent'
Promise = require 'bluebird'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
DecksModule = require '../../../lib/data_access/decks'
Logger = require '../../../../app/common/logger'
config = require '../../../../config/config'
t = require 'tcomb-validation'
UtilsGameSession = require '../../../../app/common/utils/utils_game_session.coffee'
GameSession = require '../../../../app/sdk/gameSession'
Errors = require '../../../lib/custom_errors'
Consul = require '../../../lib/consul.coffee'
generatePushId = require '../../../../app/common/generate_push_id'
Consul = require '../../../lib/consul'
_ = require("underscore")

awsRegion = config.get('aws.region')
awsReplaysBucket = config.get('aws.replaysBucketName')

router = express.Router()

router.get "/", (req, res, next) ->
  # user id is set by a middleware
  user_id = req.user_id
  page = req.query.page

  page ?= 0

  Logger.module("API").debug "loading games for page: #{page}"

  knex("user_games").where('user_id',user_id).orderBy('game_id','desc').offset(page*10).limit(10).select()
  .then (rows) ->
    playerFacingRows = _.map(rows, (row) ->
      #row["digest"] = DecksModule.hashForDeck(row["deck_cards"], user_id)
      row = _.omit(row, ["rating","rating_delta","is_bot_game","deck_cards","deck_id"])
      return row
    )
    res.status(200).json(DataAccessHelpers.restifyData(playerFacingRows))
  .catch (error) -> next(error)

router.get "/:game_id/replay_data", (req, res, next) ->
  result = t.validate(req.params.game_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  # user id is set by a middleware
  user_id = req.user_id
  game_id = result.value

  knex("user_games").where('user_id',user_id).andWhere('game_id',game_id).first()
  .then (row) ->
    if row?
      downloadGameSessionDataAsync = new Promise (resolve,reject)->
        gameDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/#{game_id}.json"
        Logger.module("API").debug "starting download of game #{game_id} replay data from #{gameDataUrl}"
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
        mouseUIDataUrl = "https://s3.#{awsRegion}.amazonaws.com/#{awsReplaysBucket}/#{config.get('env')}/ui_events/#{game_id}.json"
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
    Logger.module("API").debug "downloaded game #{game_id} replay data. size:#{gameDataString?.length || 0}"
    if not gameDataString? or not mouseUIDataString?
      res.status(404).json({})
    else
      gameSessionData = JSON.parse(gameDataString)
      mouseUIData = JSON.parse(mouseUIDataString)

      # scrub the data here
      gameSession = GameSession.create()
      gameSession.deserializeSessionFromFirebase(JSON.parse(gameDataString))
      gameSessionData = UtilsGameSession.scrubGameSessionData(gameSession,gameSessionData,user_id,true)

      res.status(200).json({ gameSessionData: gameSessionData, mouseUIData:mouseUIData })
  .catch (error) -> next(error)

module.exports = router
