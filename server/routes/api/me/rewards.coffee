express = require 'express'
UsersModule = require '../../../lib/data_access/users'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
t = require 'tcomb-validation'
moment = require 'moment'
_ = require 'underscore'

router = express.Router()

router.get "/twitch_rewards/unread", (req, res, next) ->

  user_id = req.user.d.id

  knex("user_twitch_rewards").where({'user_id':user_id})
  .then (rewardRows) ->
    rewardRows = _.filter(rewardRows,(row) -> return row.claimed_at == null)
    if rewardRows?
      res.status(200).json(DataAccessHelpers.restifyData(rewardRows))
    else
      res.status(404).end()
  .catch (error) -> next(error)

router.put "/twitch_rewards/:twitch_reward_id", (req, res, next) ->

  user_id = req.user.d.id

  result = t.validate(req.params.twitch_reward_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  twitch_reward_id = result.value

  knex("user_twitch_rewards").where({'twitch_reward_id':twitch_reward_id,'user_id':user_id}).update({
    claimed_at: moment.utc().toDate()
  })
  .then (value) ->
    if value
      res.status(200).json({})
    else
      res.status(404).end()
  .catch (error) -> next(error)

router.get "/:reward_id", (req, res, next) ->
  result = t.validate(req.params.reward_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  reward_id = result.value

  knex("user_rewards").where({'id':reward_id,'user_id':user_id}).first()
  .then (rewardRow) ->
    if rewardRow
      res.status(200).json(DataAccessHelpers.restifyData(rewardRow))
    else
      res.status(404).end()
  .catch (error) -> next(error)


router.put "/:reward_id/read_at", (req, res, next) ->
  result = t.validate(req.params.reward_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  reward_id = result.value

  knex("user_rewards").where({'id':reward_id,'user_id':user_id}).update({
    is_unread:false
  })
  .then (value) ->
    if value
      res.status(200).json({})
    else
      res.status(404).end()
  .catch (error) -> next(error)

module.exports = router
