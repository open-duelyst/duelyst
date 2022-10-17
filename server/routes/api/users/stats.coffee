express = require 'express'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger'
t = require 'tcomb-validation'

router = express.Router()

router.get "/games/:game_type", (req, res, next) ->
  result = t.validate(req.params.game_type, t.Str)
  if not result.isValid()
    return next()

  # user id is set by a middleware
  user_id = req.user_id
  game_type = result.value

  knex("user_game_counters").where({'user_id':user_id,'game_type':game_type}).first()
  .then (statsRow) ->
    if statsRow
      res.status(200).json(DataAccessHelpers.restifyData(statsRow))
    else
      res.status(200).json({})
  .catch (error) -> next(error)

router.get "/games/:game_type/factions/:faction_id", (req, res, next) ->
  result = t.validate({
    game_type: req.params.game_type,
    faction_id: parseInt(req.params.faction_id, 10)
  }, t.struct({
    game_type: t.Str,
    faction_id: t.Number
  }))
  if not result.isValid()
    return next()

  # user id is set by a middleware
  user_id = req.user_id
  game_type = result.value.game_type
  faction_id = result.value.faction_id

  knex("user_game_faction_counters").where({'user_id':user_id,'game_type':game_type,'faction_id':faction_id}).first()
  .then (statsRow) ->
    if statsRow
      res.status(200).json(DataAccessHelpers.restifyData(statsRow))
    else
      res.status(200).json({})
  .catch (error) -> next(error)

router.get "/gauntlet_runs/top/win_count", (req, res, next) ->
  # user id is set by a preprocessor
  user_id = req.user_id

  knex("users").where({'id':user_id}).first('top_gauntlet_win_count')
  .then (statsRow) ->
    if statsRow
      res.status(200).json({
        win_count:statsRow.top_gauntlet_win_count
      })
    else
      res.status(404).end()
  .catch (error) -> next(error)

module.exports = router
