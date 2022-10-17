express = require 'express'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
RankFactory = require '../../../../app/sdk/rank/rankFactory'
RankDivisionLookup = require '../../../../app/sdk/rank/rankDivisionLookup'
config = require '../../../../config/config'
t = require 'tcomb-validation'
types = require '../../../validators/types'
moment = require("moment")
{SRankManager} = require '../../../redis/'

router = express.Router()

router.get '/current', (req, res, next) ->
  # user id is set by a middleware
  user_id = req.user_id

  knex("users").select("rank","rank_win_streak","rank_starting_at").where('id',user_id).first()
  .then (rankRow) ->
    rankRow.win_streak = rankRow.rank_win_streak
    rankRow.starting_at = rankRow.rank_starting_at
    delete rankRow.rank_win_streak
    delete rankRow.rank_starting_at
    rankRow = DataAccessHelpers.restifyData(rankRow)
    res.status(200).json(rankRow)
  .catch (error) -> next(error)

router.get '/current_ladder_position', (req, res, next) ->

  user_id = req.user_id

  MOMENT_UTC_NOW = moment().utc()
  startOfSeasonMonth = moment(MOMENT_UTC_NOW).utc().startOf('month')

  return SRankManager.getUserLadderPosition(user_id,startOfSeasonMonth)
    .then (userLadderPosition) ->
      return Promise.resolve({ladder_position:userLadderPosition})
  .then (ladderData) ->
    res.status(200).json(ladderData)
  .catch (error) -> next(error)

router.get '/history', (req, res, next) ->
  # user id is set by a middleware
  user_id = req.user_id

  knex("user_rank_history").where('user_id',user_id).orderBy('starting_at','desc').limit(12).select()
  .then (rankHistoryRows) ->
    res.status(200).json(DataAccessHelpers.restifyData(rankHistoryRows))
  .catch (error) -> next(error)

router.get '/history/game_counters', (req, res, next) ->
  # user id is set by a middleware
  user_id = req.user_id

  knex("user_game_season_counters").where('user_id',user_id).andWhere('game_type','ranked').orderBy('season_starting_at','desc').limit(12).select()
  .then (rankHistoryRows) ->
    res.status(200).json(DataAccessHelpers.restifyData(rankHistoryRows))
  .catch (error) -> next(error)

router.get '/history/:season_key/game_counter', (req, res, next) ->
  result = t.validate(req.params.season_key, types.SeasonKey)
  if not result.isValid()
    return next()

  # user id is set by a middleware
  user_id = req.user_id
  season_key = result.value
  season_starting_at = moment(season_key + " +0000", "YYYY-MM Z").utc()

  if not season_starting_at.valueOf() > 0
    return res.status(400).json({})

  knex("user_game_season_counters").where('user_id',user_id).andWhere('game_type','ranked').andWhere('season_starting_at',season_starting_at.toDate()).first()
  .then (rankHistoryRow) ->
    if !rankHistoryRow?
      # use empty default when no season counters exist
      # this can happen on new accounts that haven't played any games yet
      rankHistoryRow = {}
    res.status(200).json(DataAccessHelpers.restifyData(rankHistoryRow))
  .catch (error) -> next(error)

router.get '/top', (req, res, next) ->
  # user id is set by a middleware
  user_id = req.user_id

  knex("users").where('id',user_id).first('top_rank','top_rank_starting_at','top_rank_ladder_position')
  .then (rankRow) ->
    rankRow = DataAccessHelpers.restifyData(rankRow)
    res.status(200).json(rankRow)
  .catch (error) -> next(error)

router.get '/division_stats', (req, res, next) ->
  # user id is set by a middleware
  user_id = req.user_id

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

module.exports = router
