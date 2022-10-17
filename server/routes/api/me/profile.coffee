express = require 'express'
UsersModule = require '../../../lib/data_access/users'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
Errors = require '../../../lib/custom_errors'
t = require 'tcomb-validation'
uuid = require 'node-uuid'
moment = require 'moment'
Promise = require 'bluebird'

router = express.Router()

router.put "/portrait_id", (req, res, next) ->
  result = t.validate(req.body.portrait_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  new_portrait_id = result.value

  UsersModule.setPortraitId(user_id, new_portrait_id)
  .then () ->
    res.status(200).json({})
  .catch (error) -> next(error)

router.put "/battle_map_id", (req, res, next) ->
  result = t.validate(req.body.battle_map_id, t.maybe(t.Number))
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  new_battle_map_id = result.value

  UsersModule.setBattleMapId(user_id, new_battle_map_id)
  .then () ->
    res.status(200).json({})
  .catch (error) -> next(error)

router.put "/card_back_id", (req, res, next) ->
  result = t.validate(req.body.card_back_id, t.Number)
  if not result.isValid()
    return res.status(400).json(result.errors)

  user_id = req.user.d.id
  new_card_back_id = result.value

  UsersModule.setCardBackId(user_id, new_card_back_id)
  .then () ->
    res.status(200).json({})
  .catch (error) -> next(error)

module.exports = router
