express = require 'express'
moment = require 'moment'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
ReferralsModule = require '../../../lib/data_access/referrals'
Errors = require '../../../lib/custom_errors'
Logger = require '../../../../app/common/logger.coffee'

router = express.Router()

router.get '/summary', (req, res, next) ->
  user_id = req.user.d.id

  knex("users").where('id',user_id).first('referral_rewards_claimed_at')
  .then (userRow)->
    userRow.referral_rewards_claimed_at ?= moment.utc(0).toDate()
    Promise.all([
      knex("user_referrals").where('user_id',user_id).select(),
      knex("user_referral_events").where('referrer_id',user_id).andWhere('created_at','>',userRow.referral_rewards_claimed_at).select()
    ])
  .spread (referralRows, unreadEventRows) ->

    Logger.module("API").debug "referralRows", referralRows
    Logger.module("API").debug "unreadEventRows", unreadEventRows

    referralRows = DataAccessHelpers.restifyData(referralRows) || []
    unreadEventRows = DataAccessHelpers.restifyData(unreadEventRows) || []

    stats = {}

    for row in referralRows
      stats["signups"] ?= 0
      stats["signups"]++
      if row.level_reached > 0
        stats["silver"] ?= 0
        stats["silver"]++
      if row.level_reached > 1
        stats["gold"] ?= 0
        stats["gold"]++

    unclaimedRewards = {}

    for row in unreadEventRows
      switch row.event_type
        when "silver"
          unclaimedRewards.spirit_orbs ?= 0
          unclaimedRewards.spirit_orbs += 1
        when "gold"
          unclaimedRewards.gold ?= 0
          unclaimedRewards.gold += 200
        # when "purchase"
        #   unclaimedRewards.gold ?= 0
        #   unclaimedRewards.gold += 10

    res.status(200).json({
      stats: stats
      unclaimed_rewards: unclaimedRewards
    })
  .catch (error) -> next(error)

router.get '/', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_referrals")
    .select('user_referrals.*','username')
    .where('user_id',user_id)
    .leftJoin('users', 'users.id', 'user_referrals.referred_user_id')
  .then (rows) ->
    rows = DataAccessHelpers.restifyData(rows)
    res.status(200).json(rows)
  .catch (error) -> next(error)

router.get '/events/recent', (req, res, next) ->
  user_id = req.user.d.id

  knex("user_referral_events")
    .select('username','event_type','user_referral_events.created_at')
    .where('user_referral_events.referrer_id',user_id)
    .orderBy('user_referral_events.created_at','desc')
    .leftJoin('users', 'users.id', 'user_referral_events.referred_user_id')
    .limit(20)
  .then (rows) ->
    rows = DataAccessHelpers.restifyData(rows)
    res.status(200).json(rows)
  .catch (error) -> next(error)

router.get '/events/unread', (req, res, next) ->
  user_id = req.user.d.id

  knex("users").where('id',user_id).first('referral_rewards_claimed_at')
  .then (userRow)->
    knex("user_referral_events").where('referrer_id',user_id).andWhere('created_at','>',userRow.referral_rewards_claimed_at).select()
  .then (rows) ->
    rows = DataAccessHelpers.restifyData(rows)
    res.status(200).json(rows)
  .catch (error) -> next(error)

router.post '/rewards/claim', (req, res, next) ->
  user_id = req.user.d.id

  ReferralsModule.claimReferralRewards(user_id)
  .then (rewards) ->
    res.status(200).json(rewards)
  .catch Errors.BadRequestError, (error)->
    res.status(304).json({})
  .catch (error) ->
    next(error)

module.exports = router
