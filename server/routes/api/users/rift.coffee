express = require 'express'
util = require 'util'
RiftModule = require '../../../lib/data_access/rift'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
Errors = require '../../../lib/custom_errors'
t = require 'tcomb-validation'
knex = require '../../../lib/data_access/knex'
_ = require 'underscore'

router = express.Router()

# Summary data
router.get '/', (req, res, next) ->
  user_id = req.user_id

  pruneRiftRunData = (riftRunData) ->
    return {
      user_id:       riftRunData.user_id
      ticket_id:     riftRunData.ticket_id
      win_count:     riftRunData.win_count
      loss_count:   riftRunData.loss_count
      draw_count:   riftRunData.draw_count
      rift_level:   riftRunData.rift_level
      rift_points:   riftRunData.rift_points
      started_at:   riftRunData.started_at
      faction_id:   riftRunData.faction_id
      general_id:   riftRunData.general_id
      rift_rating:   riftRunData.rift_rating
    }


  knex("user_rift_runs").where('user_id',user_id).orderBy("rift_rating",'desc').first()
  .then (highestRatingRiftRunRow) ->
    responseData = {}

    if highestRatingRiftRunRow?
      highestRatingRiftRunRow = DataAccessHelpers.restifyData(highestRatingRiftRunRow)
      responseData["highest_rated_run"] = pruneRiftRunData(highestRatingRiftRunRow)
    else
      responseData["highest_rated_run"] = {}

    res.status(200).json(responseData)
  .catch (error) -> next(error)



module.exports = router
