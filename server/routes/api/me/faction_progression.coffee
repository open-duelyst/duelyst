express = require 'express'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
t = require 'tcomb-validation'

router = express.Router()

router.get '/', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_faction_progression").where('user_id',user_id).select()
  .then (progressionRows) ->
    progressionRows = DataAccessHelpers.restifyData(progressionRows)
    responseData = {}
    for row in progressionRows
      responseData[row.faction_id] = row
    res.status(200).json(responseData)
  .catch (error) -> next(error)

router.get '/:faction_id', (req, res, next) ->
  result = t.validate(parseInt(req.params.faction_id, 10), t.Number)
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  faction_id = result.value

  knex("user_faction_progression").where('user_id',user_id).andWhere('faction_id',faction_id).first()
  .then (row) ->
    row = DataAccessHelpers.restifyData(row)
    res.status(200).json(row)
  .catch (error) -> next(error)



module.exports = router
