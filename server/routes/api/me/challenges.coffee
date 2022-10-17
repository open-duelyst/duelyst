express = require 'express'
util = require 'util'
knex = require '../../../lib/data_access/knex'
ChallengesModule = require '../../../lib/data_access/challenges'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
t = require 'tcomb-validation'
moment = require 'moment'
Errors = require '../../../lib/custom_errors'

router = express.Router()

router.get '/gated', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_challenges").where('user_id',user_id).select()
  .then (challengeRows) ->
    challengeRows = DataAccessHelpers.restifyData(challengeRows)
    res.status(200).json(challengeRows)
  .catch (error) -> next(error)

router.get '/gated/:challenge_type', (req, res, next) ->
  result = t.validate(req.params.challenge_type, t.Str)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  challenge_type = result.value

  knex("user_challenges").where({'user_id':user_id,'challenge_id':challenge_type}).select()
  .then (challengeRow) ->
    res.status(200).json(challengeRow)
  .catch (error) -> next(error)

router.put "/gated/:challenge_type/last_attempted_at", (req, res, next) ->
  result = t.validate(req.params.challenge_type, t.Str)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  challenge_type = result.value

  ChallengesModule.markChallengeAsAttempted(user_id,challenge_type)
  .then (value) ->
    res.status(200).json(value)
  .catch (error) ->
    Logger.module("API").error("Failed to set challenge #{challenge_type} as attempted for #{user_id.blue}".red + " ERROR: "+util.inspect(error))
    next(error)

router.put "/gated/:challenge_type/completed_at", (req, res, next) ->
  # validate challenge type
  result = t.validate(req.params.challenge_type, t.Str)
  if not result.isValid()
    return res.status(400).json(result.errors)

  # validate process quest request param
  process_quests = t.validate(req.body.process_quests, t.maybe(t.Boolean))
  if not process_quests.isValid()
    return res.status(400).json(process_quests.errors)

  user_id = req.user.d.id
  challenge_type = result.value
  process_quests = process_quests.value

  ChallengesModule.completeChallengeWithType(user_id,challenge_type,process_quests)
  .then (challengeResult) ->
    if challengeResult
      # First challenge completion
      res.status(200).json(challengeResult)
    else
      # Challenge was already completed
      res.status(304).json({})
  .catch (error) ->
    Logger.module("API").error("Failed to set challenge #{challenge_type} as completed for #{user_id.blue}".red + " ERROR: "+util.inspect(error))
    next(error)

router.get "/daily/completed_at", (req, res, next) ->
  user_id = req.user.d.id

  knex("users").where('id',user_id).first("daily_challenge_last_completed_at")
  .then (userRow) ->
    lastCompletedData = {
      daily_challenge_last_completed_at: userRow.daily_challenge_last_completed_at
    }
    lastCompletedData = DataAccessHelpers.restifyData(lastCompletedData)
    res.status(200).json(lastCompletedData)
  .catch (error) -> next(error)

router.put "/daily/:challenge_id/completed_at", (req, res, next) ->
  # validate challenge type
  result = t.validate(req.params.challenge_id, t.Str)
  if not result.isValid()
    return res.status(400).json(result.errors)

  result2 = t.validate(req.body.completed_at,t.Number)
  if not result2.isValid()
    return res.status(400).json(result2.errors)

  user_id = req.user.d.id
  challenge_id = result.value
  completed_at = result2.value

  ChallengesModule.markDailyChallengeAsCompleted(user_id,challenge_id,null,moment.utc(completed_at))
  .then (challengeResult) ->
    if challengeResult
      # First challenge completion
      res.status(200).json(challengeResult)
    else
      # Challenge was already completed
      res.status(304).json({})
  .catch Errors.AlreadyExistsError, (error) ->
    Logger.module("API").error("Challenge ID #{challenge_id} already completed for user ID #{user_id.blue}")
    res.status(304).json({})
  .catch Errors.DailyChallengeTimeFrameError, (error) ->
    Logger.module("API").error("Daily challenge completed_at #{completed_at} outside allowable time frame for user ID #{user_id.blue}")
    res.status(400).json({message:"Daily challenge completion outside allowable time frame. Local clock may be skewed."})
  .catch (error) ->
    Logger.module("API").error("Failed to set challenge #{challenge_id} as completed for #{user_id.blue}".red + " ERROR: "+util.inspect(error))
    next(error)

module.exports = router
