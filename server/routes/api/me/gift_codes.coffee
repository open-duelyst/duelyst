express = require 'express'
util = require 'util'
UsersModule = require '../../../lib/data_access/users.coffee'
ReferralsModule = require '../../../lib/data_access/referrals.coffee'
GiftCodesModule = require '../../../lib/data_access/gift_codes.coffee'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Errors = require '../../../lib/custom_errors'
Logger = require '../../../../app/common/logger.coffee'
t = require 'tcomb-validation'
validator = require 'validator'
validators = require '../../../validators'
validatorTypes = require '../../../validators/types'

router = express.Router()

router.post '/', (req, res, next) ->
  user_id = req.user.d.id
  gift_code = req.body.gift_code

  result = t.validate(gift_code, validatorTypes.GiftCode)
  if not result.isValid()
    return res.status(400).json({message:'Invalid gift code.'})

  # if this is a gift coee
  if validator.isUUID(gift_code)

    GiftCodesModule.redeemGiftCode(user_id,gift_code)
    .then () ->
      Logger.module("API").debug "user #{user_id} redeemed gift code"
      res.status(200).json({})
    .catch Errors.NotFoundError, (e) -> res.status(400).json(e)
    .catch Errors.BadRequestError, (e) -> res.status(400).json(e)
    .catch (error) -> next(error)

  # else assume it's a referral code
  else

    Logger.module("API").debug "user #{user_id} redeemed referral code #{gift_code}"

    UsersModule.userIdForUsername(gift_code)
    .then (referrer_id)->
      if not referrer_id
        throw new Errors.NotFoundError()
      ReferralsModule.markUserAsReferredByFriend(user_id,referrer_id)
    .then () ->
      res.status(200).json({})
    .catch Errors.NotFoundError, (e) -> res.status(400).json(e)
    .catch Errors.BadRequestError, (e) -> res.status(400).json(e)
    .catch (error) -> next(error)

module.exports = router
