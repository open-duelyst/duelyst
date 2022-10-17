express = require 'express'

AchievementsModule = require '../../../lib/data_access/achievements'
Logger = require '../../../../app/common/logger.coffee'
DataAccessHelpers = require '../../../lib/data_access/helpers'

t = require 'tcomb-validation'
moment = require 'moment'
knex = require '../../../lib/data_access/knex'

WartechGeneralFaction1Achievement = require '../../../../app/sdk/achievements/wartechAchievements/wartechGeneralFaction1Achievement.coffee'
WartechGeneralFaction2Achievement = require '../../../../app/sdk/achievements/wartechAchievements/wartechGeneralFaction2Achievement.coffee'
WartechGeneralFaction3Achievement = require '../../../../app/sdk/achievements/wartechAchievements/wartechGeneralFaction3Achievement.coffee'
WartechGeneralFaction4Achievement = require '../../../../app/sdk/achievements/wartechAchievements/wartechGeneralFaction4Achievement.coffee'
WartechGeneralFaction5Achievement = require '../../../../app/sdk/achievements/wartechAchievements/wartechGeneralFaction5Achievement.coffee'
WartechGeneralFaction6Achievement = require '../../../../app/sdk/achievements/wartechAchievements/wartechGeneralFaction6Achievement.coffee'

router = express.Router()

router.put "/:achievement_id/read_at", (req, res, next) ->
  result = t.validate(req.params.achievement_id, t.Str)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  achievement_id = result.value

  AchievementsModule.markAchievementAsRead(user_id,achievement_id)
  .then (value) ->
    res.status(200).json(value)
  .catch (error) ->
    Logger.module("API").error "Failed to mark achievement #{achievement_id} as read for #{user_id.blue}".red + " ERROR: "+error.message
    next(error)

router.post "/login/", (req, res, next) ->
  user_id = req.user.d.id

  AchievementsModule.updateAchievementsProgressWithLogin(user_id,moment.utc())
  .then (value) ->
    res.status(200).json(value)
  .catch (error) ->
    Logger.module("API").error "Failed to update login achievements for #{user_id.blue}".red + " ERROR: "+error.message
    next(error)

router.get "/wartech_generals/progress", (req, res, next) ->
  user_id = req.user.d.id

  userAchievementsColumns = ['user_id','achievement_id','progress','progress_required']

  return Promise.all([
    knex("user_achievements").first(userAchievementsColumns).where('user_id',user_id).andWhere('achievement_id',WartechGeneralFaction1Achievement.id),
    knex("user_achievements").first(userAchievementsColumns).where('user_id',user_id).andWhere('achievement_id',WartechGeneralFaction2Achievement.id),
    knex("user_achievements").first(userAchievementsColumns).where('user_id',user_id).andWhere('achievement_id',WartechGeneralFaction3Achievement.id),
    knex("user_achievements").first(userAchievementsColumns).where('user_id',user_id).andWhere('achievement_id',WartechGeneralFaction4Achievement.id),
    knex("user_achievements").first(userAchievementsColumns).where('user_id',user_id).andWhere('achievement_id',WartechGeneralFaction5Achievement.id),
    knex("user_achievements").first(userAchievementsColumns).where('user_id',user_id).andWhere('achievement_id',WartechGeneralFaction6Achievement.id)
  ]).spread (userWartechAchievementRows)->
    userWartechAchievementRows = DataAccessHelpers.restifyData(userWartechAchievementRows)
    res.status(200).json(userWartechAchievementRows)
  .catch (error) ->
    Logger.module("API").error "Failed to retrieve general achievement progress for #{user_id.blue}".red + " ERROR: "+error.message
    next(error)

module.exports = router
