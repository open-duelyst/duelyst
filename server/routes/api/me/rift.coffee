express = require 'express'
util = require 'util'
RiftModule = require '../../../lib/data_access/rift'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
Errors = require '../../../lib/custom_errors'
t = require 'tcomb-validation'
knex = require '../../../lib/data_access/knex'
Promise = require 'bluebird'
_ = require 'underscore'

router = express.Router()

# Summary data
router.get '/', (req, res, next) ->
  user_id = req.user.d.id

  pruneRiftRunData = (riftRunData) ->
    return {
      user_id:       riftRunData.user_id
      ticket_id:     riftRunData.ticket_id
      win_count:     riftRunData.win_count
      loss_count:   riftRunData.loss_count
      draw_count:   riftRunData.draw_count
      rift_level:   riftRunData.rift_level
      rift_points:   riftRunData.rift_points
      started_at:   riftRunData.started_at
      faction_id:   riftRunData.faction_id
      general_id:   riftRunData.general_id
      deck:         riftRunData.deck
      rift_rating:   riftRunData.rift_rating
    }


  knex("user_rift_runs").where('user_id',user_id).andWhere("win_count",">",0).orderBy("rift_rating",'desc').first()
  .then (highestRatingRiftRunRow) ->
    responseData = {}

    if highestRatingRiftRunRow?
      highestRatingRiftRunRow = DataAccessHelpers.restifyData(highestRatingRiftRunRow)
      responseData["highest_rated_run"] = pruneRiftRunData(highestRatingRiftRunRow)
    else
      responseData["highest_rated_run"] = {}

    res.status(200).json(responseData)
  .catch (error) -> next(error)

router.get "/runs", (req, res, next) ->

  user_id = req.user.d.id

  knex("user_rift_runs").where('user_id',user_id).orderBy('created_at','desc').select()
  .then (rows) ->
    return Promise.map(rows, (riftRunRow) ->
      return RiftModule.sanitizeRunCardChoicesIfNeeded(riftRunRow)
    )
  .then (rows) ->
    playerFacingRows = _.map(rows, (row) ->
      row = _.omit(row,["rating","rating_delta","is_bot_game"])
      return row
    )
    res.status(200).json(DataAccessHelpers.restifyData(playerFacingRows))
  .catch (error) -> next(error)

router.post "/runs", (req, res, next) ->
  result = t.validate(req.body.ticket_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  ticket_id = result.value

  RiftModule.startRun(user_id,ticket_id)
  .then (data) ->
    Logger.module("API").log "Rift run STARTED for user #{user_id.blue}".cyan
    res.status(200).json(DataAccessHelpers.restifyData(data))
  .catch (error) ->
    Logger.module("API").log "ERROR starting rift run for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.post "/runs/free", (req, res, next) ->

  user_id = req.user.d.id

  RiftModule.claimFirstFreeRiftTicket(user_id)
  .then (ticketId)->
    return RiftModule.startRun(user_id,ticketId)
  .then (data) ->
    Logger.module("API").log "Free Rift run STARTED for user #{user_id.blue}".cyan
    res.status(200).json(DataAccessHelpers.restifyData(data))
  .catch (error) ->
    Logger.module("API").log "ERROR starting free rift run for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.put "/runs/:ticket_id/general_id", (req, res, next) ->
  result = t.validate(req.body.general_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  general_id = result.value
  ticket_id = req.params.ticket_id

  RiftModule.chooseGeneral(user_id,ticket_id,general_id)
  .then (data) ->
    Logger.module("API").log "Rift general #{general_id} selected for user #{user_id.blue} ticket #{ticket_id}".cyan
    res.status(200).json(data)
  .catch (error) ->
    Logger.module("API").log "ERROR choosing rift general for user #{user_id.blue} ticket #{ticket_id}".red, util.inspect(error)
    next(error)

router.post "/runs/:ticket_id/card_id_to_upgrade", (req, res, next) ->
  result = t.validate(req.body.card_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  ticket_id = req.params.ticket_id
  card_id = result.value

  RiftModule.chooseCardToUpgrade(user_id,ticket_id,card_id)
  .then (data) ->
    Logger.module("API").log "Rift card #{card_id} selected for upgrade for user #{user_id.blue} ticket #{ticket_id}".cyan
    res.status(200).json(DataAccessHelpers.restifyData(data))
  .catch (error) ->
    Logger.module("API").log "ERROR choosing rift card to upgrade for user #{user_id.blue} ticket #{ticket_id}".red, util.inspect(error)
    next(error)

router.post "/runs/:ticket_id/upgrade", (req, res, next) ->
  result = t.validate(req.body.card_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  ticket_id = req.params.ticket_id
  card_id = result.value

  RiftModule.upgradeCard(user_id,ticket_id,card_id)
  .then (data) ->
    Logger.module("API").log "Rift card upgraded to #{card_id} for user #{user_id.blue} ticket #{ticket_id}".cyan
    res.status(200).json(DataAccessHelpers.restifyData(data))
  .catch (error) ->
    Logger.module("API").log "ERROR upgrading rift card for user #{user_id.blue} ticket #{ticket_id}".red, util.inspect(error)
    next(error)

router.post "/runs/:ticket_id/store_upgrade", (req, res, next) ->

  user_id = req.user.d.id
  ticket_id = req.params.ticket_id

  RiftModule.storeCurrentUpgrade(user_id,ticket_id)
  .then (data) ->
    Logger.module("API").log "Rift upgrade stored for user #{user_id.blue} ticket #{ticket_id}".cyan
    res.status(200).json(DataAccessHelpers.restifyData(data))
  .catch (error) ->
    Logger.module("API").log "ERROR storing upgrade pack for user #{user_id.blue} ticket #{ticket_id}".red, util.inspect(error)
    next(error)

router.post "/runs/:ticket_id/reroll_upgrade", (req, res, next) ->

  user_id = req.user.d.id
  ticket_id = req.params.ticket_id

  RiftModule.rerollCurrentUpgrade(user_id,ticket_id)
  .then (data) ->
    Logger.module("API").log "Rift upgrade rerolled for user #{user_id.blue} ticket #{ticket_id}".cyan
    res.status(200).json(DataAccessHelpers.restifyData(data))
  .catch (error) ->
    Logger.module("API").log "ERROR rerolling upgrade pack for user #{user_id.blue} ticket #{ticket_id}".red, util.inspect(error)
    next(error)

module.exports = router
