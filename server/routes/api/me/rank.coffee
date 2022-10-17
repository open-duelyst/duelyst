express = require 'express'
moment = require 'moment'
util = require 'util'
RankModule = require '../../../lib/data_access/rank'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
Errors = require '../../../lib/custom_errors'
RankFactory = require '../../../../app/sdk/rank/rankFactory'
RankDivisionLookup = require '../../../../app/sdk/rank/rankDivisionLookup'
t = require 'tcomb-validation'
types = require '../../../validators/types'
{SRankManager} = require '../../../redis/'

router = express.Router()

router.get '/', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_rank").where('user_id',user_id).select()
  .then (questRows) ->
    challengeRows = DataAccessHelpers.restifyData(challengeRows)
    res.status(200).json(questRows)
  .catch (error) -> next(error)

router.post "/", (req, res, next) ->
  user_id = req.user.d.id

  Logger.module("API").debug "Cycling (if needed) ranking for user #{user_id.blue}".magenta

  RankModule.userNeedsSeasonStartRanking(user_id)
  .then (value) ->
    #check if we need to update rank
    if !value
      Logger.module("API").debug("RANKING does not need to be cycled for #{user_id.blue}")
      return res.status(304).json({})
    else
      Logger.module("API").debug "Cycling SEASON RANKING for #{user_id.blue}".magenta
      return RankModule.cycleUserSeasonRanking(user_id)
      .then (value) ->
        # all good, send the rank over
        Logger.module("API").debug "SEASON RANKING cycled for #{user_id.blue}".cyan
        res.status(200).json(value)
      .catch (error) ->
        # oops, looks like we have an error
        Logger.module("API").debug("SEASON RANKING failed to cycle for #{user_id.blue}".red + " ERROR: "+util.inspect(error))
        next(error)
  .catch (error) ->
    Logger.module("API").debug("Failed to detect if we need a new SEASON RANKING for #{user_id.blue}".red + " ERROR: "+util.inspect(error))
    next(error)

router.get '/history', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_rank_history").where('user_id',user_id).orderBy('starting_at','desc').limit(12).select()
  .then (rankHistoryRows) ->
    res.status(200).json(DataAccessHelpers.restifyData(rankHistoryRows))
  .catch (error) -> next(error)

router.get '/history/game_counters', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_game_season_counters").where('user_id',user_id).andWhere('game_type','ranked').orderBy('season_starting_at','desc').limit(12).select()
  .then (rankHistoryRows) ->
    res.status(200).json(DataAccessHelpers.restifyData(rankHistoryRows))
  .catch (error) -> next(error)


router.get '/history/:season_key/game_counter', (req, res, next) ->

  user_id = req.user.d.id
  season_starting_at = moment(req.params.season_key + " +0000", "YYYY-MM Z").utc()

  if not season_starting_at.valueOf() > 0
    res.status(400).json({})
    return

  knex("user_game_season_counters").where('user_id',user_id).andWhere('game_type','ranked').andWhere('season_starting_at',season_starting_at.toDate()).first()
  .then (rankHistoryRow) ->
    if rankHistoryRow?
      res.status(200).json(DataAccessHelpers.restifyData(rankHistoryRow))
    else
      res.status(200).json({})
  .catch (error) -> next(error)

router.get '/top', (req, res, next) ->
  user_id = req.user.d.id

  knex("users").where('id',user_id).first('top_rank','top_rank_starting_at','top_rank_ladder_position')
  .then (rankRow) ->
    rankRow = DataAccessHelpers.restifyData(rankRow)
    res.status(200).json(rankRow)
  .catch (error) -> next(error)

router.get '/division_stats', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_rank_history").where('user_id',user_id).select()
  .then (rankHistoryRows) ->
    stats = {}
    for rankKey,rankValue of RankDivisionLookup
      stats[rankKey] = { count: 0 }
    for row in rankHistoryRows
      divisionKey = RankFactory.rankedDivisionKeyForRank(row.rank)
      stats[divisionKey].count += 1
    res.status(200).json(stats)
  .catch (error) -> next(error)

router.get '/current_ladder_position', (req, res, next) ->

  user_id = req.user.d.id

  MOMENT_UTC_NOW = moment().utc()
  startOfSeasonMonth = moment(MOMENT_UTC_NOW).utc().startOf('month')

  return SRankManager.getUserLadderPosition(user_id,startOfSeasonMonth)
  .then (userLadderPosition) ->
    return Promise.resolve({ladder_position:userLadderPosition})
  .then (ladderData) ->
    res.status(200).json(ladderData)
  .catch (error) -> next(error)

#  knex("user_rank_ratings").first("ladder_position").where('user_id',user_id).andWhere("season_starting_at",seasonStartingAt)
#  .then (rankRow) ->
#    rankRow = rankRow || {}
#    rankRow = DataAccessHelpers.restifyData(rankRow)
#    res.status(200).json(rankRow)
#  .catch (error) -> next(error)

router.put "/history/:season_key/claim_rewards", (req, res, next) ->
  result = t.validate(req.params.season_key, types.SeasonKey)
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  season_key = result.value
  season_starting_at = moment(season_key + " +0000", "YYYY-MM Z")

  RankModule.claimRewardsForSeasonRank(user_id,season_starting_at)
  .then (data)->
    Logger.module("API").debug "Season #{season_key} rewards claimed for user #{user_id.blue}".cyan
    res.status(200).json(data)
  .catch Errors.AlreadyExistsError, (error)->
    Logger.module("API").debug "ERROR: season #{season_key} rewards already claimed by user #{user_id.blue}".red, util.inspect(error)
    res.status(403).json({message:"The rewards for season #{season_key} have already been claimed previously."})
  .catch (error)->
    Logger.module("API").debug "ERROR claiming season #{season_key} rewards for user #{user_id.blue}".red, util.inspect(error)
    next(error)

module.exports = router
