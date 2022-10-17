###
Job - Update a users charge log with data sent in wallet_update
###
config = require '../../config/config.js'
ShopModule = require '../../server/lib/data_access/shop'
Logger = require '../../app/common/logger.coffee'
generatePushId = require '../../app/common/generate_push_id'
moment = require 'moment'
knex = require 'server/lib/data_access/knex'

###*
# Job - 'update-user-charge-log'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  userId = job.data.userId || null
  fullfillmentData = job.data.fullfillmentData || null

  if !userId
    return done(new Error("update-user-charge-log: User ID is not defined."))

  if !fullfillmentData
    return done(new Error("update-user-charge-log: fulfillment is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User #{userId} Charge Log")

  this_obj = {}

  this_obj.currencyAmount = fullfillmentData.currency_amount
  this_obj.totalPlatinumAmount = fullfillmentData.total_platinum_amount
  if !this_obj.currencyAmount?
    return Promise.reject(new Error("update-user-charge-log: Invalid currency amount #{this_obj.currencyAmount} for userId #{userId}"))
  if !this_obj.totalPlatinumAmount?
    return Promise.reject(new Error("update-user-charge-log: Invalid platinum amount #{this_obj.totalPlatinumAmount} for userId #{userId}"))

  this_obj.fullfillmentPrice = Math.floor(100*(this_obj.currencyAmount || 0))

  txPromise = knex.transaction (tx) ->

    return tx("users").where('id',userId).first().forUpdate()
    .bind this_obj
    .then (userRow)->
      sku = "diamond_" + @.totalPlatinumAmount
      return ShopModule._addChargeToUser(txPromise,tx,userRow,userId,sku,@.fullfillmentPrice,"usd",generatePushId(),fullfillmentData,"unknown",moment.utc())

  return txPromise
  .then () ->
    Logger.module("JOB").debug("[J:#{job.id}] Update User #{userId} Charge Log done()")
    return done()
  .catch (error) ->
    return done(error)
