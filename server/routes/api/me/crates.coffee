express = require 'express'
util = require 'util'
knex = require '../../../lib/data_access/knex'
CosmeticChestsModule = require '../../../lib/data_access/cosmetic_chests'
Logger = require '../../../../app/common/logger.coffee'
colors = require 'colors'
t = require 'tcomb-validation'
validators = require '../../../validators'
DataAccessHelpers = require '../../../lib/data_access/helpers'
GiftCrateModule = require '../../../lib/data_access/gift_crate.coffee'
zlib = require 'zlib'
Promise = require 'bluebird'
moment = require 'moment'

# promisify
Promise.promisifyAll(zlib)

router = express.Router()

router.put "/cosmetic_chest/:chest_id/unlock", (req, res, next) ->
  chestIdResult = t.validate(req.params.chest_id, t.subtype(t.Str, (s) -> s.length == 20))
  if not chestIdResult.isValid()
    return res.status(400).json(chestIdResult.errors)

  #keyIdResult = t.validate(req.body.key_id, t.subtype(t.Str, (s) -> s.length == 20))
  #if not keyIdResult.isValid()
  #  return res.status(400).json(keyIdResult.errors)

  user_id = req.user.d.id
  chest_id = chestIdResult.value
  #key_id = keyIdResult.value

  Logger.module("API").debug "Opening Cosmetic Chest #{chest_id} for user #{user_id.blue}".magenta
  CosmeticChestsModule.openChest(user_id,chest_id)
  .then (rewardData)->
    Logger.module("API").debug "Opened Cosmetic Chest #{chest_id} for user #{user_id.blue}".cyan
    res.status(200).json(rewardData)
  .catch (error) ->
    Logger.module("API").error "ERROR Opening Cosmetic Chest #{chest_id} for user #{user_id.blue}".red
    next(error)

router.get '/gift_crates', (req, res, next) ->
  user_id = req.user.d.id
  knex("user_gift_crates").where('user_id',user_id).select()
  .then (giftCrateRows) ->
    giftCrateRows = DataAccessHelpers.restifyData(giftCrateRows)
    res.status(200).json(giftCrateRows)
  .catch (error) -> next(error)

router.put "/gift_crate/:crate_id/unlock", (req, res, next) ->
  result = t.validate(req.params.crate_id, t.subtype(t.Str, (s) -> s.length <= 36))
  if not result.isValid()
    return next()

  user_id = req.user.d.id
  crate_id = result.value

  GiftCrateModule.unlockGiftCrate(user_id,crate_id)
  .then (rewardData)->
    Logger.module("API").debug "Gift crate #{crate_id} unlocked for user #{user_id.blue}".cyan
    res.status(200).json(rewardData)
  .catch (error)->
    Logger.module("API").error "ERROR claiming gift crate #{crate_id} rewards for user #{user_id.blue}".red, util.inspect(error)
    next(error)

module.exports = router
