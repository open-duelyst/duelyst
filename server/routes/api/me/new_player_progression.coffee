express = require 'express'
UsersModule = require '../../../lib/data_access/users'
QuestsModule = require '../../../lib/data_access/quests'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
t = require 'tcomb-validation'

# sdk
NewPlayerProgressionHelper = require '../../../../app/sdk/progression/newPlayerProgressionHelper'
NewPlayerProgressionModuleLookup = require('../../../../app/sdk/progression/newPlayerProgressionModuleLookup')
NewPlayerProgressionStageEnum = require('../../../../app/sdk/progression/newPlayerProgressionStageEnum')

router = express.Router()

router.get "/", (req, res, next) ->
  user_id = req.user.d.id

  knex("user_new_player_progression").where('user_id',user_id).select()
  .then (challengeRows) ->
    challengeRows = DataAccessHelpers.restifyData(challengeRows)
    res.status(200).json(challengeRows)
  .catch (error) -> next(error)

router.post "/core", (req, res, next) ->

  user_id = req.user.d.id

  UsersModule.iterateNewPlayerCoreProgression(user_id)
  .then (data)->
    if data
      res.status(200).json(DataAccessHelpers.restifyData(data))
    else
      res.status(304).json({})
  .catch (error) -> next(error)

router.post "/:module_name/stage", (req, res, next) ->
  module_name = t.validate(req.params.module_name, t.Str)
  if not module_name.isValid()
    return next()
  stage = t.validate(req.body.stage, t.Str)
  if not stage.isValid()
    return res.status(400).json(stage.errors)

  user_id = req.user.d.id
  module_name = module_name.value
  stage = stage.value

  UsersModule.setNewPlayerFeatureProgression(user_id,module_name,stage)
  .bind {}
  .then (progressionData) ->
    @.progressionData = progressionData
    if module_name == NewPlayerProgressionModuleLookup.Core and NewPlayerProgressionHelper.questsForStage(stage)
      return QuestsModule.generateBeginnerQuests(user_id)
    else
      return Promise.resolve()
  .then (questData)->
    if questData
      @.questData = questData
    res.status(200).json(DataAccessHelpers.restifyData(@))
  .catch (error) -> next(error)

module.exports = router
