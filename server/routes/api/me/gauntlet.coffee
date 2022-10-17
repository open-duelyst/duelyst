express = require 'express'
util = require 'util'
moment = require 'moment'
Promise = require 'bluebird'
_ = require 'underscore'
GauntletModule = require '../../../lib/data_access/gauntlet'
knex = require '../../../lib/data_access/knex'
Logger = require '../../../../app/common/logger.coffee'
Errors = require '../../../lib/custom_errors'
CONFIG = require '../../../../app/common/config'
DataAccessHelpers = require '../../../lib/data_access/helpers'
t = require 'tcomb-validation'

router = express.Router()

router.post "/", (req, res, next) ->
  result = t.validate(req.body.ticket_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  ticket_id = result.value

  GauntletModule.startRun(user_id,ticket_id)
  .then (data) ->
    Logger.module("API").debug "Arena run STARTED for user #{user_id.blue}".cyan
    res.status(200).json(data)
  .catch (error) ->
    Logger.module("API").error "ERROR starting arena run for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.delete "/current", (req, res, next) ->
  user_id = req.user.d.id

  GauntletModule.resignRun(user_id)
  .then (data) ->
    Logger.module("API").debug "Arena run RESIGNED by user #{user_id.blue}".cyan
    res.status(200).json(data)
  .catch (error) ->
    Logger.module("API").error "ERROR resigning arena run for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.put "/current/faction_id", (req, res, next) ->
  result = t.validate(req.body.faction_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  faction_id = result.value

  GauntletModule.chooseFaction(user_id,faction_id)
  .then (data) ->
    Logger.module("API").debug "Arena faction #{faction_id} selected for user #{user_id.blue}".cyan
    res.status(200).json(data)
  .catch (error) ->
    Logger.module("API").error "ERROR choosing arena faction for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.post "/current/cards", (req, res, next) ->
  result = t.validate(req.body.card_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  card_id = result.value

  GauntletModule.chooseCard(user_id,card_id)
  .then (data) ->
    Logger.module("API").debug "Arena card #{card_id} selected for user #{user_id.blue}".cyan
    res.status(200).json(data)
  .catch (error) ->
    Logger.module("API").error "ERROR choosing arena card for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.put "/current/rewards_claimed_at", (req, res, next) ->
  user_id = req.user.d.id

  GauntletModule.claimRewards(user_id)
  .then (data) ->
    Logger.module("API").debug "Arena rewards claimed for user #{user_id.blue}".cyan
    res.status(200).json(data)
  .catch Errors.ArenaRewardsAlreadyClaimedError, (error)->
    Logger.module("API").error "ERROR: arena rewards already claimed for user #{user_id.blue}".red, util.inspect(error)
    res.status(403).json({message:"The rewards for this run have already been claimed previously."})
  .catch (error) ->
    Logger.module("API").error "ERROR claiming arena rewards for user #{user_id.blue}".red, util.inspect(error)
    next(error)

router.get "/decks", (req, res, next) ->
  user_id = req.user.d.id

  currentGauntletDeckPromise = knex("user_gauntlet_run").first().where("user_id",user_id)

  decksExpireMoment = moment.utc().subtract(CONFIG.DAYS_BEFORE_GAUNTLET_DECK_EXPIRES,"days")
  recentGauntletDecksPromise = knex("user_gauntlet_run_complete").select().where("user_id",user_id).andWhere("ended_at",">",decksExpireMoment.toDate()).orderBy("ended_at","desc")

  Promise.all([currentGauntletDeckPromise,recentGauntletDecksPromise])
  .spread (currentRunRow,recentRunRows) ->
    runs = []
    _.each(recentRunRows, (recentRun) ->
      if (recentRun.is_complete)
        runs.push(recentRun)
    )
    if (currentRunRow? and currentRunRow.is_complete)
      runs.unshift(currentRunRow)

    res.status(200).json(DataAccessHelpers.restifyData(runs))
  .catch (error) ->
    Logger.module("API").error "ERROR getting gauntlet decks for user #{user_id.blue}".red, util.inspect(error)
    next(error)

module.exports = router
