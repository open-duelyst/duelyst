express = require 'express'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'

router = express.Router()

router.get '/', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_ribbons").where('user_id',user_id).select()
  .then (rows) ->
    rows = DataAccessHelpers.restifyData(rows)
    res.status(200).json(rows)
  .catch (error) -> next(error)

module.exports = router
