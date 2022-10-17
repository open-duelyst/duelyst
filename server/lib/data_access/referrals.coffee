Promise = require 'bluebird'
util = require 'util'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
_ = require 'underscore'
SyncModule = require './sync'
InventoryModule = require './inventory'
UsersModule = require './users'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
DataAccessHelpers = require('./helpers')

# redis
{Redis, Jobs, GameManager} = require '../../redis/'

class ReferralsModule

  ###*
  # Marks a user as referred by a friend and creates the referral record.
  # @public
  # @param  {String}  userId      User's ID
  # @param  {String}  referrerId    Referrer's ID
  # @return  {Promise}
  ###
  @markUserAsReferredByFriend: (userId,referrerId)->

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    trxPromise = knex.transaction (tx)->
      Promise.all([
        tx("users").where('id',userId).first('id','referred_by_user_id','created_at','purchase_count','top_rank').forUpdate(),
        tx("users").where('id',referrerId).first('id','referred_by_user_id').forUpdate(),
        tx("user_progression").where('user_id',userId).first('game_count')
      ])
      .bind this_obj
      .spread (userRow,referrerRow,progressionRow)->

        @.userRow = userRow

        if !userRow or !referrerRow
          throw new Errors.NotFoundError("Could not find user or referrer.")

        if userRow.referred_by_user_id
          throw new Errors.AlreadyExistsError("This user already has a referral record.")

        if referrerRow.referred_by_user_id == userId
          throw new Errors.BadRequestError("User can not be marked as referred by one of their referrals.")

        if userId == referrerId
          throw new Errors.BadRequestError("Can not be marked as referred by self.")

        diff = MOMENT_NOW_UTC.valueOf() - moment.utc(userRow.created_at).valueOf()
        duration = moment.duration(diff)

        # Logger.module("ReferralsModule").debug "markUserAsReferredByFriend() -> #{userId} days since registration - #{duration.asDays()}."

        if duration.asDays() > 30
          throw new Errors.BadRequestError("Can not set referral info on players registered over 30 days ago.")

        if progressionRow?.game_count >= 1
          throw new Errors.BadRequestError("Can not set referral info on players who have played ranked games.")

        return Promise.all([
          InventoryModule.giveUserGold(trxPromise,tx,userId,100,"referral code"),
          tx("users").where('id',userId).update({
            referred_by_user_id: referrerId
          }),
          tx("user_referrals").insert({
            user_id: referrerId
            referred_user_id: userId
          })
        ])

      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        allPromises = []
        allPromises.push FirebasePromises.update(rootRef.child('users').child(userId),{
          referred_by_user_id: referrerId
        })
        #
        #
        # allPromises.push(FirebasePromises.set(rootRef.child('users').child(userId).child("buddies").child(referrerId),{
        #   createdAt:MOMENT_NOW_UTC.valueOf()
        # }))
        # allPromises.push(FirebasePromises.set(rootRef.child('users').child(referrerId).child("buddies").child(userId),{
        #   createdAt:MOMENT_NOW_UTC.valueOf()
        # }))
        #
        return Promise.all(allPromises)
      .then () -> return SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()-> # backfill any events a user has achieved

      allPromises = []

      Logger.module("ReferralsModule").debug "markUserAsReferredByFriend() -> #{userId} backfilling",  @.userRow

      # if the user has made any purchases
      if @.userRow.purchase_count > 0
        allPromises.push ReferralsModule.processReferralEventForUser(userId,referrerId,"purchase")

      # if the user has achieved any rank so far
      if @.userRow.top_rank
        if @.userRow.top_rank <= 20
          allPromises.push ReferralsModule.processReferralEventForUser(userId,referrerId,"silver")
        if @.userRow.top_rank <= 10
          allPromises.push ReferralsModule.processReferralEventForUser(userId,referrerId,"gold")

      return Promise.all(allPromises)
    .then ()->
      Logger.module("ReferralsModule").debug "markUserAsReferredByFriend() -> marked #{userId} with as referred by #{referrerId}"
      return Promise.resolve(true)
    .catch (e)->
      Logger.module("ReferralsModule").error "markUserAsReferredByFriend() -> error marking #{userId} with friend #{referrerId}"
      throw e
    return trxPromise

  ###*
  # Update relevant referral data for a user generated referral event
  # @public
  # @param  {String}  userId      User ID.
  # @param  {String}  referrerId    Referrer ID.
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @processReferralEventForUser: (userId,referrerId,eventType)->

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    return knex.transaction (tx)->
      Promise.all([
        tx("users").where('id',userId).first('referred_by_user_id').forUpdate()
        tx("user_referrals").where('referred_user_id',userId).first().forUpdate()
      ])
      .bind this_obj
      .spread (userRow,referralRow)->

        @.userRow = userRow

        if !userRow.referred_by_user_id or userRow.referred_by_user_id != referrerId
          throw new Errors.NotFoundError("Invalid referral process event request: user has invalid referrer")

        if !referralRow?
          throw new Errors.NotFoundError("Referral row not found")

        Logger.module("ReferralsModule").debug "processReferralEventForUser() -> \"#{eventType}\" by user #{userId}"

        allPromises = []
        allPromises.push tx("user_referral_events").insert(
          referrer_id:referralRow.user_id
          referred_user_id:userId
          event_type:eventType
          created_at:MOMENT_NOW_UTC.toDate()
        )

        levelReached = 0
        switch eventType
          when "silver" then levelReached = 1
          when "gold" then levelReached = 2

        if referralRow.level_reached < levelReached

          @.claimableReferralRewardsUpdated = true

          allPromises.push tx("user_referrals").where('referred_user_id',userId).update(
            level_reached: levelReached
            updated_at: MOMENT_NOW_UTC.toDate()
          )

          allPromises.push tx("users").where('id',referralRow.user_id).update(
            referral_rewards_updated_at:MOMENT_NOW_UTC.toDate()
          )

          Logger.module("ReferralsModule").debug "processReferralEventForUser() -> notifiying #{referralRow.user_id} of reward via #{userId}"

          # fire this off async
          UsersModule.inGameNotify(referralRow.user_id,"you have a new referral reward","referral")

        return Promise.all(allPromises)

      .then ()->

        if eventType == "purchase"

          # kick off a job to process this referral event
          Jobs.create("update-user-achievements",
            name: "Process User Referral Achievements"
            title: util.format("User %s :: Received Achievement Eligble Referral Event %s", @.userRow.referred_by_user_id, "purchase")
            userId: @.userRow.referred_by_user_id
            referralEventType: "purchase"
          ).removeOnComplete(true).ttl(15000).save()

      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        if @.claimableReferralRewardsUpdated
          return FirebasePromises.update(rootRef.child('users').child(referrerId),{ referral_rewards_updated_at:MOMENT_NOW_UTC.valueOf() })
        else
          return Promise.resolve(true)
      .then tx.commit
      .catch tx.rollback
      return

  ###*
  # Claim any un-claimed referral rewards
  # @public
  # @param  {String}  userId      User ID.
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @claimReferralRewards: (userId)->

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    trxPromise = knex.transaction (tx)->
      tx("users").where('id',userId).first('id','referral_rewards_claimed_at','referral_rewards_updated_at').forUpdate()
      .bind this_obj
      .then (userRow)->

        # Logger.module("ReferralsModule").debug "claimReferralRewards() -> user #{userId}", userRow

        if !userRow.referral_rewards_updated_at or userRow.referral_rewards_claimed_at > userRow.referral_rewards_updated_at
          throw new Errors.BadRequestError("No new rewards available")

        userRow.referral_rewards_claimed_at ?= moment.utc(0)
        return tx("user_referral_events").where('referrer_id',userId).andWhere('created_at','>',userRow.referral_rewards_claimed_at)

      .then (referralEventRows)->

        allPromises = []

        rewards = @.rewards = []

        # for each referral event type, check for unclaimed rewards
        for referralEvent in referralEventRows
          if referralEvent.event_type == "silver"

            rewards.push
              id:          generatePushId()
              user_id:       userId
              reward_category:   'referral'
              reward_type:     referralEvent.event_type
              source_id:       referralEvent.referred_user_id
              created_at:     MOMENT_NOW_UTC.toDate()
              spirit_orbs:    1
              is_unread:      true

            allPromises.push InventoryModule.addBoosterPackToUser(trxPromise,tx,userId,1,"referral","#{referralEvent.referred_user_id}:#{referralEvent.event_type}")

          if referralEvent.event_type == "gold"

            rewards.push
              id:          generatePushId()
              user_id:       userId
              reward_category:   'referral'
              reward_type:     referralEvent.event_type
              source_id:       referralEvent.referred_user_id
              created_at:     MOMENT_NOW_UTC.toDate()
              gold:        200
              is_unread:      true

            allPromises.push InventoryModule.giveUserGold(trxPromise,tx,userId,200,"referral #{referralEvent.event_type} reward")

          # if referralEvent.event_type == "purchase"
          #
          #   rewards.push
          #     id:          generatePushId()
          #     user_id:       userId
          #     reward_category:   'referral'
          #     reward_type:     referralEvent.event_type
          #     source_id:       referralEvent.referred_user_id
          #     created_at:     MOMENT_NOW_UTC.toDate()
          #     gold:        10
          #     is_unread:      true
          #
          #   allPromises.push InventoryModule.giveUserGold(trxPromise,tx,userId,10,"referral #{referralEvent.event_type} reward")

        for reward in rewards
          allPromises.push tx('user_rewards').insert(reward)

        # if we've recieved any rewards, mark our referral code as claimed
        if allPromises.length > 0
          allPromises.push tx("users").where('id',userId).update(
            referral_rewards_claimed_at:MOMENT_NOW_UTC.toDate()
          )

        return Promise.all(allPromises)

      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        return FirebasePromises.update(rootRef.child('users').child(userId),{ referral_rewards_claimed_at:MOMENT_NOW_UTC.valueOf() })
      .then () -> return SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return
    .bind this_obj
    .then ()->
      Logger.module("ReferralsModule").debug "claimReferralRewards() -> user #{userId} rewards", @.rewards
      return @.rewards

    return trxPromise

module.exports = ReferralsModule
