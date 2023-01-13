Promise = require 'bluebird'
util = require 'util'
crypto = require 'crypto'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
fbUtil = require '../../../app/common/utils/utils_firebase.js'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
validator = require 'validator'
uuid = require 'node-uuid'
moment = require 'moment'
_ = require 'underscore'
SyncModule = require './sync'
MigrationsModule = require './migrations'
InventoryModule = require './inventory'
QuestsModule = require './quests'
GamesModule = require './games'
RiftModule = require './rift'
RiftModule = require './gauntlet'
CosmeticChestsModule = require './cosmetic_chests'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
DataAccessHelpers = require('./helpers')
hashHelpers = require '../hash_helpers.coffee'
AnalyticsUtil = require '../../../app/common/analyticsUtil.coffee'
{version} = require '../../../version.json'
grantFullCollection = require '../collection.coffee'

# redis
{Redis, Jobs, GameManager} = require '../../redis/'

# SDK imports
SDK = require '../../../app/sdk'
Cards = require '../../../app/sdk/cards/cardsLookupComplete'
CardSetFactory = require '../../../app/sdk/cards/cardSetFactory'
RankFactory = require '../../../app/sdk/rank/rankFactory'
Entity = require '../../../app/sdk/entities/entity'
QuestFactory = require '../../../app/sdk/quests/questFactory'
QuestType = require '../../../app/sdk/quests/questTypeLookup'
GameType = require '../../../app/sdk/gameType'
GameFormat = require '../../../app/sdk/gameFormat'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
NewPlayerProgressionHelper = require '../../../app/sdk/progression/newPlayerProgressionHelper'
NewPlayerProgressionStageEnum = require '../../../app/sdk/progression/newPlayerProgressionStageEnum'
NewPlayerProgressionModuleLookup = require '../../../app/sdk/progression/newPlayerProgressionModuleLookup'

{Redis, Jobs} = require '../../redis/'

class UsersModule

  ###*
  # MAX number of daily games to count for play rewards.
  # @public
  ###
  @DAILY_REWARD_GAME_CAP: 200

  ###*
  # Hours until FWOTD is available again.
  # @public
  ###
  @DAILY_WIN_CYCLE_HOURS: 22

  ###*
  # Retrieve an active and valid global referral code.
  # @public
  # @param  {String}  code    Referral Code
  # @return  {Promise}        Promise that will return true or throw InvalidReferralCodeError exception .
  ###
  @getValidReferralCode: (code) ->

    # validate referral code and force it to lower case
    code = code?.toLowerCase().trim()
    if not validator.isLength(code,4)
      return Promise.reject(new Errors.InvalidReferralCodeError("invalid referral code"))

    MOMENT_NOW_UTC = moment().utc()

    # we check if the referral code is a UUID so that anyone accidentally using invite codes doesn't error out
    if validator.isUUID(code)
      return Promise.resolve({})

    return knex("referral_codes").where('code',code).first()
    .then (referralCodeRow)->
      if referralCodeRow? and
      referralCodeRow?.is_active and
      (!referralCodeRow?.signup_limit? or referralCodeRow?.signup_count < referralCodeRow?.signup_limit) and
      (!referralCodeRow?.expires_at? or moment.utc(referralCodeRow?.expires_at).isAfter(MOMENT_NOW_UTC))
        return referralCodeRow
      else
        throw new Errors.InvalidReferralCodeError("referral code not found")

  ###*
  # Check if an invite code is valid.
  # @public
  # @param  {String}  inviteCode  Invite Code
  # @return  {Promise}        Promise that will return true or throw InvalidInviteCodeError exception .
  ###
  @isValidInviteCode: (inviteCode,cb) ->

    inviteCode ?= null

    return knex("invite_codes").where('code',inviteCode).first()
    .then (codeRow)->
      if !config.get("inviteCodesActive") || codeRow? || inviteCode is "kumite14" || inviteCode is "keysign789"
        return true
      else
        throw new Errors.InvalidInviteCodeError("Invalid Invite Code")

  ###*
  # Create a user record for the specified parameters.
  # @public
  # @param  {String}  username    User's username
  # @param  {String}  password    User's password
  # @param  {String}  inviteCode    Invite code used
  # @return  {Promise}          Promise that will return the userId on completion.
  ###
  @createNewUser: (username,password,inviteCode = 'kumite14',referralCode,campaignData,registrationSource = null)->
    # validate referral code and force it to lower case
    referralCode = referralCode?.toLowerCase().trim()
    if referralCode? and not validator.isLength(referralCode,3)
      return Promise.reject(new Errors.InvalidReferralCodeError("invalid referral code"))

    userId = generatePushId()
    username = username.toLowerCase()
    inviteCode ?= null

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    return knex("invite_codes").where('code',inviteCode).first()
    .bind this_obj
    .then (inviteCodeRow)->

      if config.get("inviteCodesActive") and !inviteCodeRow and inviteCode != "kumite14" and inviteCode != "keysign789"
        throw new Errors.InvalidInviteCodeError("Invite code not found")

      referralCodePromise = Promise.resolve(null)
      # we check if the referral code is a UUID so that anyone accidentally using invite codes doesn't error out
      if referralCode? and not validator.isUUID(referralCode)
        referralCodePromise = UsersModule.getValidReferralCode(referralCode)

      return Promise.all([
        UsersModule.userIdForUsername(username),
        referralCodePromise
      ])
    .spread (idForUsername,referralCodeRow)->
      if idForUsername
        throw new Errors.AlreadyExistsError("Username not available")

      @.referralCodeRow = referralCodeRow

      return hashHelpers.generateHash(password)

    .then (passwordHash)->

      return knex.transaction (tx) =>

        userRecord =
          id:userId
          username:username
          password:passwordHash
          created_at:MOMENT_NOW_UTC.toDate()

        if registrationSource
          userRecord.registration_source = registrationSource

        if config.get("inviteCodesActive")
          userRecord.invite_code = inviteCode

        # Add campaign data to userRecord
        if campaignData?
          userRecord.campaign_source ?= campaignData.campaign_source
          userRecord.campaign_medium ?= campaignData.campaign_medium
          userRecord.campaign_term ?= campaignData.campaign_term
          userRecord.campaign_content ?= campaignData.campaign_content
          userRecord.campaign_name ?= campaignData.campaign_name
          userRecord.referrer ?= campaignData.referrer

        updateReferralCodePromise = Promise.resolve()
        if @.referralCodeRow?
          Logger.module("USERS").debug "createNewUser() -> using referral code #{referralCode.yellow} for user #{userId.blue} ", @.referralCodeRow.params
          userRecord.referral_code = referralCode
          updateReferralCodePromise = knex("referral_codes").where('code',referralCode).increment('signup_count',1).transacting(tx)
          if @.referralCodeRow.params?.gold
            userRecord.wallet_gold ?= 0
            userRecord.wallet_gold += @.referralCodeRow.params?.gold
          if @.referralCodeRow.params?.spirit
            userRecord.wallet_spirit ?= 0
            userRecord.wallet_spirit += @.referralCodeRow.params?.spirit

        Promise.all([
          # user record
          knex('users').insert(userRecord).transacting(tx),
          # update referal code table
          updateReferralCodePromise
        ])
        .bind this_obj
        .then ()-> return DuelystFirebase.connect().getRootRef()
        .then (rootRef)->

          # collect all the firebase update promises here
          allPromises = []

          userData = {
            id: userId
            username: username
            created_at: MOMENT_NOW_UTC.valueOf()
            presence: {
              rank: 30
              username: username
              status: "offline"
            }
            tx_counter: {
              count:0
            }
            # all new users have accepted EULA before signing up
            hasAcceptedEula: false
          }

          starting_gold = @.referralCodeRow?.params?.gold || 0
          starting_spirit = @.referralCodeRow?.params?.spirit || 0

          allPromises.push(FirebasePromises.set(rootRef.child('users').child(userId),userData))
          allPromises.push(FirebasePromises.set(rootRef.child('username-index').child(username),userId))
          allPromises.push(FirebasePromises.set(rootRef.child('user-inventory').child(userId).child('wallet'),{
            gold_amount:starting_gold
            spirit_amount:starting_spirit
          }))

          return Promise.all(allPromises)
        .then tx.commit
        .catch tx.rollback
        return

      .bind this_obj
      .then ()->
        if config.get("inviteCodesActive")
          return knex("invite_codes").where('code',inviteCode).delete()

      .then ()->
        # User has been created. Grant a full collection and return.
        grantFullCollection(userId)
        return Promise.resolve(userId)

  ###*
  # Delete a newly created user record in the event of partial registration.
  # @public
  # @param  {String}  userId      User's ID
  # @return  {Promise}          Promise that will return the userId on completion.
  ###
  @deleteNewUser: (userId) ->
    username = null

    return @userDataForId(userId)
    .then (userRow) ->
      if !userRow
        throw new Errors.NotFoundError()
      username = userRow.username
      return knex("users").where('id',userId).delete()
    .then () -> return DuelystFirebase.connect().getRootRef()
    .then (rootRef) ->
      promises = [
        FirebasePromises.remove(rootRef.child('users').child(userId)),
        FirebasePromises.remove(rootRef.child('user-inventory').child(userId))
      ]
      if username
        promises.push(FirebasePromises.remove(rootRef.child('username-index').child(username)))
      return Promise.all(promises)


  ###*
  # Change a user's username.
  # It will skip gold check if the username has never been set (currently null)
  # @public
  # @param  {String}  userId      User ID
  # @param  {String}  username    New username
  # @param  {Moment}  systemTime    Pass in the current system time to override clock. Used mostly for testing.
  # @return  {Promise}          Promise that will return on completion.
  ###
  @changeUsername: (userId,newUsername,forceItForNoGold=false,systemTime)->

    MOMENT_NOW_UTC = systemTime || moment().utc()
    this_obj = {}

    return UsersModule.userIdForUsername(newUsername)
    .bind {}
    .then (existingUserId)->
      if existingUserId
        throw new Errors.AlreadyExistsError("Username already exists")
      else
        return knex.transaction (tx)->
          knex("users").where('id',userId).first('username','username_updated_at','wallet_gold').forUpdate().transacting(tx)
          .bind {}
          .then (userRow)->
            # we should have a user
            if !userRow
              throw new Errors.NotFoundError()

            # let's figure out if we're allowed to change the username and how much it should cost
            # if username was null, price stays 0
            price = 0
            if not forceItForNoGold and userRow.username_updated_at and userRow.username
              price = 100
              timeSinceLastChange = moment.duration(MOMENT_NOW_UTC.diff(moment.utc(userRow.username_updated_at)))
              if timeSinceLastChange.asMonths() < 1.0
                throw new Errors.InvalidRequestError("Username can't be changed twice in one month")

            @.price = price
            @.oldUsername = userRow.username

            if price > 0 and userRow.wallet_gold < price
              throw new Errors.InsufficientFundsError("Insufficient gold to update username")

            allUpdates = []

            # if username was null, we skip setting the updated_at flag since it is being set for first time
            if !@.oldUsername
              userUpdateParams =
                username:newUsername
            else
              userUpdateParams =
                username:newUsername
                username_updated_at:MOMENT_NOW_UTC.toDate()

            if price > 0

              userUpdateParams.wallet_gold = userRow.wallet_gold-price
              userUpdateParams.wallet_updated_at = MOMENT_NOW_UTC.toDate()

              userCurrencyLogItem =
                id:          generatePushId()
                user_id:      userId
                gold:        -price
                memo:        "username change"
                created_at:      MOMENT_NOW_UTC.toDate()

              allUpdates.push knex("user_currency_log").insert(userCurrencyLogItem).transacting(tx)

            allUpdates.push knex("users").where('id',userId).update(userUpdateParams).transacting(tx)

            return Promise.all(allUpdates)

          .then ()-> return DuelystFirebase.connect().getRootRef()
          .then (rootRef)->

            updateWalletData = (walletData)=>
              walletData ?= {}
              walletData.gold_amount ?= 0
              walletData.gold_amount -= @.price
              walletData.updated_at = MOMENT_NOW_UTC.valueOf()
              return walletData

            allPromises = [
              FirebasePromises.set(rootRef.child('username-index').child(newUsername),userId)
              FirebasePromises.set(rootRef.child('users').child(userId).child('presence').child('username'),newUsername)
            ]
            # if username was null, we skip setting the updated_at flag since it is being set for first time
            # and there is no old index to remove
            if !@.oldUsername
              allPromises.push(FirebasePromises.update(rootRef.child('users').child(userId),{username: newUsername}))
            else
              allPromises.push(FirebasePromises.remove(rootRef.child('username-index').child(@.oldUsername)))
              allPromises.push(FirebasePromises.update(rootRef.child('users').child(userId),{username: newUsername, username_updated_at:MOMENT_NOW_UTC.valueOf()}))

            if @.price > 0
              allPromises.push FirebasePromises.safeTransaction(rootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

            return Promise.all(allPromises)
          .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
          .then tx.commit
          .catch tx.rollback
          return

  ###*
  # Change a user's password.
  # @public
  # @param  {String}  userId        User ID
  # @param  {String}  oldPassword      Old password
  # @param  {String}  newPassword      New password
  # @return  {Promise}            Promise that will return on completion.
  ###
  @changePassword: (userId,oldPassword,newPassword)->

    MOMENT_NOW_UTC = moment().utc()

    return knex.transaction (tx)->
      knex("users").where('id',userId).first('password').forUpdate().transacting(tx)
      .bind {}
      .then (userRow)->
        if !userRow
          throw new Errors.NotFoundError()
        else
          return hashHelpers.comparePassword(oldPassword, userRow.password)
      .then (match) ->
        if (!match)
          throw new Errors.BadPasswordError()
        else
          return hashHelpers.generateHash(newPassword)
      .then (hash) ->
        knex("users").where('id',userId).update({
          password:hash
          password_updated_at:MOMENT_NOW_UTC.toDate()
        }).transacting(tx)
      .then tx.commit
      .catch tx.rollback
      return

  ###*
  # Associate a Google Play ID to a User
  # @public
  # @param  {String}  userId User ID
  # @param  {String}  googlePlayId User's Google Play ID
  # @return  {Promise}  Promise that will return on completion
  ###
  @associateGooglePlayId: (userId, googlePlayId) ->

    MOMENT_NOW_UTC = moment().utc()

    return knex.transaction (tx) ->
      knex("users").where('id',userId).first().forUpdate().transacting(tx)
      .bind {}
      .then (userRow)->
        if !userRow
          throw new Errors.NotFoundError()
        else
          knex("users").where('id',userId).update({
            google_play_id: googlePlayId
            google_play_associated_at: MOMENT_NOW_UTC.toDate()
          }).transacting(tx)
      .then tx.commit
      .catch tx.rollback
      return

  ###*
  # Disassociate a Google Play ID to a User
  # Currently only used for testing
  # @public
  # @param  {String}  userId User ID
  # @return  {Promise}  Promise that will return on completion.
  ###
  @disassociateGooglePlayId: (userId) ->

    return knex.transaction (tx) ->
      knex("users").where('id',userId).first().forUpdate().transacting(tx)
      .bind {}
      .then (userRow)->
        if !userRow
          throw new Errors.NotFoundError()
        else
          knex("users").where('id',userId).update({
            google_play_id: null
            google_play_associated_at: null
          }).transacting(tx)
      .then tx.commit
      .catch tx.rollback
      return

  ###*
  # Associate a Gamecenter ID to a user
  # @public
  # @param  {String}  userId User ID
  # @param  {String}  gamecenterId User's Gamecenter Id
  # @return  {Promise}  Promise that will return on completion
  ###
  @associateGameCenterId: (userId, gameCenterId) ->

    MOMENT_NOW_UTC = moment().utc()

    return knex.transaction (tx) ->
      knex("users").where('id',userId).first().forUpdate().transacting(tx)
      .bind {}
      .then (userRow)->
        if !userRow
          throw new Errors.NotFoundError()
        else
          knex("users").where('id',userId).update({
            gamecenter_id: gameCenterId
            gamecenter_associated_at: MOMENT_NOW_UTC.toDate()
          }).transacting(tx)
      .then tx.commit
      .catch tx.rollback
      return

  ###*
  # Disassociate a Gamecenter ID to a User
  # Currently only used for testing
  # @public
  # @param  {String}  userId User ID
  # @return  {Promise}  Promise that will return on completion.
  ###
  @disassociateGameCenterId: (userId) ->

    return knex.transaction (tx) ->
      knex("users").where('id',userId).first().forUpdate().transacting(tx)
      .bind {}
      .then (userRow)->
        if !userRow
          throw new Errors.NotFoundError()
        else
          knex("users").where('id',userId).update({
            gamecenter_id: null
            gamecenter_associated_at: null
          }).transacting(tx)
      .then tx.commit
      .catch tx.rollback
      return

  ###*
  # Get user data for id.
  # @public
  # @param  {String}  userId      User ID
  # @return  {Promise}          Promise that will return the user data on completion.
  ###
  @userDataForId: (userId)->
    return knex("users").first().where('id',userId)

  ###*
  # Intended to be called on login/reload to bump session counter and check transaction counter to update user caches / initiate any hot copies.
  # @public
  # @param  {String}  userId      User ID
  # @param  {Object}  userData    User data if previously loaded
  # @return  {Promise}          Promise that will return synced when done
  ###
  @bumpSessionCountAndSyncDataIfNeeded: (userId,userData=null,systemTime=null)->

    MOMENT_NOW_UTC = systemTime || moment().utc()

    startPromise = null
    if userData
      startPromise = Promise.resolve(userData)
    else
      startPromise = knex("users").where('id',userId).first('id','created_at','session_count','last_session_at','last_session_version')

    return startPromise

    .then (userData)->

      @.userData = userData

      if not @.userData?
        throw new Errors.NotFoundError("User not found")

      # Check if user needs to have emotes migrated to cosmetics inventory
      return MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(@.userData)
    .then (userNeedsMigrateEmotes) ->
      if userNeedsMigrateEmotes
        return MigrationsModule.userMigrateEmotes20160708(userId,MOMENT_NOW_UTC)
      else
        return Promise.resolve()
    .then () ->
      return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(@.userData)
    .then (userNeedsPrismaticBackfill) ->
      if userNeedsPrismaticBackfill
        return MigrationsModule.userBackfillPrismaticRewards(userId,MOMENT_NOW_UTC)
      else
        return Promise.resolve()
    .then ()-> # migrate user charge counts for purchase limits
      return MigrationsModule.checkIfUserNeedsChargeCountsMigration(@.userData).then (needsMigration)->
        if needsMigration
          return MigrationsModule.userCreateChargeCountsMigration(userId)
        else
          return Promise.resolve()
    .then ()->
      return MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(@.userData).then (needsMigration)->
        if needsMigration
          return MigrationsModule.userIncompleteGauntletRefund(userId)
        else
          return Promise.resolve()
    .then ()->
      return MigrationsModule.checkIfUserNeedsUnlockableOrbsRefund(@.userData).then (needsMigration)->
        if needsMigration
          return MigrationsModule.userUnlockableOrbsRefund(userId)
        else
          return Promise.resolve()
    .then () ->
      lastSessionTime = moment.utc(@.userData.last_session_at).valueOf() || 0
      duration = moment.duration(MOMENT_NOW_UTC.valueOf() - lastSessionTime)

      if moment.utc(@.userData.created_at).isBefore(moment.utc("2016-06-18")) and moment.utc(@.userData.last_session_at).isBefore(moment.utc("2016-06-18"))
        Logger.module("UsersModule").debug "bumpSessionCountAndSyncDataIfNeeded() -> starting inventory achievements for user - #{userId.blue}."
        # Kick off job to update achievements
        Jobs.create("update-user-achievements",
          name: "Update User Inventory Achievements"
          title: util.format("User %s :: Update Inventory Achievements", userId)
          userId: userId
          inventoryChanged: true
        ).removeOnComplete(true).save()

      if duration.asHours() > 2

        return knex("users").where('id',userId).update(
          session_count: @.userData.session_count+1
          last_session_at: MOMENT_NOW_UTC.toDate()
        )

      else

        return Promise.resolve()

    .then ()->

      # Update a user's last seen session if needed

      if not @.userData.last_session_version? or @.userData.last_session_version != version
        return knex("users").where('id',userId).update(
          last_session_version: version
        )
      else
        return Promise.resolve()

    .then ()->

      return SyncModule.syncUserDataIfTrasactionCountMismatched(userId,@.userData)

    .then (synced)->

      # # Job: Sync user buddy data
      # Jobs.create("data-sync-user-buddy-list",
      #   name: "Sync User Buddy Data"
      #   title: util.format("User %s :: Sync Buddies", userId)
      #   userId: userId
      # ).removeOnComplete(true).save()

      return synced

  ###*
  # Intended to be called on login/reload to fire off a job which tracks cohort data for given user
  # @public
  # @param  {String}  userId      User ID
  # @param  {Moment}  systemTime    Pass in the current system time to use. Used only for testing.
  # @return  {Promise}  Promise.resolve() for now since all handling is done in job
  ###
  @createDaysSeenOnJob: (userId,systemTime) ->
    MOMENT_NOW_UTC = systemTime || moment().utc()

    Jobs.create("update-user-seen-on",
      name: "Update User Seen On"
      title: util.format("User %s :: Update Seen On", userId)
      userId: userId
      userSeenOn: MOMENT_NOW_UTC.valueOf()
    ).removeOnComplete(true).save()

    return Promise.resolve()

  ###*
  # Updates the users row if they have newly logged in on a set day
  # @public
  # @param  {String}  userId      User ID
  # @param  {Moment}  userSeenOn    Moment representing the time the user was seen (at point of log in)
  # @return  {Promise}  Promise that completes when user's days seen is updated (if needed)
  ###
  @updateDaysSeen: (userId,userSeenOn) ->
    return knex.first('created_at','seen_on_days').from('users').where('id',userId)
    .then (userRow) ->
      recordedDayIndex = AnalyticsUtil.recordedDayIndexForRegistrationAndSeenOn(moment.utc(userRow.created_at),userSeenOn)

      if not recordedDayIndex?
        return Promise.resolve()
      else
        userSeenOnDays = userRow.seen_on_days || []

        needsUpdate = false
        if not _.contains(userSeenOnDays,recordedDayIndex)
          needsUpdate = true
          userSeenOnDays.push(recordedDayIndex)

        # perform update if needed
        if needsUpdate
          return knex('users').where({'id':userId}).update({seen_on_days:userSeenOnDays})
        else
          return Promise.resolve()

  ###*
  # Get the user ID for the specified username.
  # @public
  # @param  {String}  username  User's username (CaSE in-sensitive)
  # @return  {Promise}        Promise that will return the userId data on completion.
  ###
  @userIdForUsername: (username, callback) ->

    # usernames are ALWAYS lowercase, so when searching downcase by default
    username = username?.toLowerCase()

    return knex.first('id').from('users').where('username',username)
    .then (userRow) ->
      return new Promise( (resolve, reject) ->
        if userRow
          return resolve(userRow.id)
        else
          return resolve(null)
      ).nodeify(callback)

  ###*
  # Get the user ID for the specified Google Play ID.
  # @public
  # @param  {String}  googlePlayId  User's Google Play ID
  # @return  {Promise}  Promise that will return the userId data on completion.
  ###
  @userIdForGooglePlayId: (googlePlayId, callback) ->

    return knex.first('id').from('users').where('google_play_id',googlePlayId)
    .then (userRow) ->
      return new Promise( (resolve, reject) ->
        if userRow
          return resolve(userRow.id)
        else
          return resolve(null)
      ).nodeify(callback)

  ###*
  # Get the user ID for the specified Gamecenter ID.
  # @public
  # @param  {String}  gameCenterId  User's Gamecenter ID
  # @return  {Promise}  Promise that will return the userId data on completion.
  ###
  @userIdForGameCenterId: (gameCenterId, callback) ->

    return knex.first('id').from('users').where('gamecenter_id',gameCenterId)
    .then (userRow) ->
      return new Promise( (resolve, reject) ->
        if userRow
          return resolve(userRow.id)
        else
          return resolve(null)
      ).nodeify(callback)

  ###*
  # Validate that a deck is valid and that the user is allowed to play it.
  # @public
  # @param  {String}  userId      User ID.
  # @param  {Array}    deck      Array of card objects with at least card IDs.
  # @param  {String}  gameType  game type (see SDK.GameType)
  # @param  {Boolean}  [forceValidation=false]  Force validation regardless of ENV. Useful for unit tests.
  # @return  {Promise}          Promise that will resolve if the deck is valid and throw an "InvalidDeckError" otherwise
  ###
  @isAllowedToUseDeck: (userId,deck,gameType, ticketId, forceValidation) ->

    # userId must be defined
    if !userId || !deck
      Logger.module("UsersModule").debug "isAllowedToUseDeck() -> invalid user ID or deck parameter - #{userId.blue}.".red
      return Promise.reject(new Errors.InvalidDeckError("invalid user ID or deck - #{userId}"))

    # on DEV + STAGING environments, always allow any deck
    if !forceValidation and config.get('allCardsAvailable')
      Logger.module("UsersModule").debug "isAllowedToUseDeck() -> valid deck because this environment allows all cards ALL_CARDS_AVAILABLE = #{config.get('allCardsAvailable')} - #{userId.blue}.".green
      return Promise.resolve(true)

    # check for valid general
    deckFactionId = null
    generalId = deck[0]?.id
    if generalId?
      generalCard = SDK.GameSession.getCardCaches().getCardById(generalId)

    if not generalCard?.isGeneral
      Logger.module("UsersModule").debug "isAllowedToUseDeck() -> first card in the deck must be a general - #{userId.blue}.".yellow
      return Promise.reject(new Errors.InvalidDeckError("First card in the deck must be a general"))
    else
      deckFactionId = generalCard.factionId

    if gameType == GameType.Gauntlet

      Logger.module("UsersModule").debug "isAllowedToUseDeck() -> Allowing ANY arena deck for now - #{userId.blue}.".green
      return Promise.resolve(true)

    else if ticketId? && gameType == GameType.Friendly
#      # Validate a friendly rift deck
#      return RiftModule.getRiftRunDeck(userId,ticketId)
#      .then (riftDeck) ->
#        sortedDeckIds = _.sortBy(_.map(deck,(cardObject) -> return cardObject.id),(id) -> return id)
#        sortedRiftDeckIds = _.sortBy(riftDeck,(id)-> return id)
#        if (sortedDeckIds.length != sortedRiftDeckIds.length)
#          return Promise.reject(new Errors.InvalidDeckError("Friendly rift deck has incorrect card count: " + sortedDeckIds.length))
#
#        for i in [0...sortedDeckIds.length]
#          if sortedDeckIds[i] != sortedRiftDeckIds[i]
#            return Promise.reject(new Errors.InvalidDeckError("Friendly rift deck has incorrect cards"))
#
#        return Promise.resolve(true)
      # Validate a friendly gauntlet deck
      decksExpireMoment = moment.utc().subtract(CONFIG.DAYS_BEFORE_GAUNTLET_DECK_EXPIRES,"days")
      currentDeckPromise = knex("user_gauntlet_run").first("deck").where("user_id",userId).andWhere("ticket_id",ticketId)
      oldDeckPromise = knex("user_gauntlet_run_complete").first("deck","ended_at").where("user_id",userId).andWhere("id",ticketId).andWhere("ended_at",">",decksExpireMoment.toDate())
      return Promise.all([currentDeckPromise,oldDeckPromise])
      .spread (currentRunRow,completedRunRow) ->
        matchingRunRow = null
        if (currentRunRow?)
          matchingRunRow = currentRunRow
        else if (completedRunRow?)
          matchingRunRow = completedRunRow
        else
          return Promise.reject(new Errors.InvalidDeckError("Friendly gauntlet deck has no matching recent run, ticket_id: " + ticketId))
        gauntletDeck = matchingRunRow.deck

        sortedDeckIds = _.sortBy(_.map(deck,(cardObject) -> return cardObject.id),(id) -> return id)
        sortedGauntletDeckIds = _.sortBy(gauntletDeck,(id)-> return id)
        if (sortedDeckIds.length != sortedGauntletDeckIds.length)
          return Promise.reject(new Errors.InvalidDeckError("Friendly gauntlet deck has incorrect card count: " + sortedDeckIds.length))

        for i in [0...sortedDeckIds.length]
          if sortedDeckIds[i] != sortedGauntletDeckIds[i]
            return Promise.reject(new Errors.InvalidDeckError("Friendly gauntlet deck has incorrect cards"))

        return Promise.resolve(true)

    else if gameType # allow all other game modes

      cardsToValidateAgainstInventory = []
      cardSkinsToValidateAgainstInventory = []
      basicsOnly = true

      for card in deck
        cardId = card.id
        sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId)
        if sdkCard.rarityId != SDK.Rarity.Fixed
          basicsOnly = false
        if sdkCard.factionId != deckFactionId && sdkCard.factionId != SDK.Factions.Neutral
          Logger.module("UsersModule").debug "isAllowedToUseDeck() -> found a card with faction #{sdkCard.factionId} that doesn't belong in a #{deckFactionId} faction deck - #{userId.blue}.".yellow
          return Promise.reject(new Errors.InvalidDeckError("Deck has cards from more than one faction"))
        if (sdkCard.rarityId != SDK.Rarity.Fixed and sdkCard.rarityId != SDK.Rarity.TokenUnit) || sdkCard.getIsUnlockable()
          cardSkinId = SDK.Cards.getCardSkinIdForCardId(cardId)
          if cardSkinId?
            # add skin to validate against inventory
            if !_.contains(cardSkinsToValidateAgainstInventory, cardSkinId)
              cardSkinsToValidateAgainstInventory.push(cardSkinId)

            # add unskinned card to validate against inventory if needed
            unskinnedCardId = SDK.Cards.getNonSkinnedCardId(cardId)
            unskinnedSDKCard = SDK.GameSession.getCardCaches().getIsSkinned(false).getCardById(unskinnedCardId)
            if unskinnedSDKCard.getRarityId() != SDK.Rarity.Fixed and unskinnedSDKCard.getRarityId() != SDK.Rarity.TokenUnit
              cardsToValidateAgainstInventory.push(unskinnedCardId)
          else
            # add card to validate against inventory
            cardsToValidateAgainstInventory.push(card.id)

      # starter decks must contain all cards in level 0 faction starter deck
      # normal decks must match exact deck size
      maxDeckSize = if CONFIG.DECK_SIZE_INCLUDES_GENERAL then CONFIG.MAX_DECK_SIZE else CONFIG.MAX_DECK_SIZE + 1
      if basicsOnly
        if deck.length < CONFIG.MIN_BASICS_DECK_SIZE
          Logger.module("UsersModule").debug "isAllowedToUseDeck() -> invalid starter deck (#{deck.length}) - #{userId.blue}.".yellow
          return Promise.reject(new Errors.InvalidDeckError("Starter decks must have at least #{CONFIG.MIN_BASICS_DECK_SIZE} cards!"))
        else if deck.length > maxDeckSize
          Logger.module("UsersModule").debug "isAllowedToUseDeck() -> invalid starter deck (#{deck.length}) - #{userId.blue}.".yellow
          return Promise.reject(new Errors.InvalidDeckError("Starter decks must not have more than #{maxDeckSize} cards!"))
      else if deck.length != maxDeckSize
        Logger.module("UsersModule").debug "isAllowedToUseDeck() -> invalid deck length (#{deck.length}) - #{userId.blue}.".yellow
        return Promise.reject(new Errors.InvalidDeckError("Deck must have #{maxDeckSize} cards"))

      # ensure that player has no more than 3 of a base card (normal + prismatic) in deck
      cardCountsById = _.countBy(deck, (cardData) ->
        return Cards.getBaseCardId(cardData.id)
      )
      for k,v of cardCountsById
        if v > 3
          return Promise.reject(new Errors.InvalidDeckError("Deck has more than 3 of a card"))

      # Ensure that player doesn't have any cards that are in development, hidden in collection, and only one general
      gameSessionCards = _.map(deck, (cardData) ->
        cardId = cardData.id
        return SDK.GameSession.getCardCaches().getCardById(cardId)
      )
      generalCount = 0
      for gameSessionCard in gameSessionCards
        if gameSessionCard instanceof Entity and gameSessionCard.getIsGeneral()
          generalCount += 1
        if not gameSessionCard.getIsAvailable(null, forceValidation)
          Logger.module("UsersModule").error "isAllowedToUseDeck() -> Deck has cards (#{gameSessionCard.id}) that are not yet available - player #{userId.blue}.".red
          return Promise.reject(new Errors.NotFoundError("Deck has cards that are not yet available"))
        if gameSessionCard.getIsHiddenInCollection()
          Logger.module("UsersModule").error "isAllowedToUseDeck() -> Deck has cards (#{gameSessionCard.id}) that are in hidden to collection - player #{userId.blue}.".red
          return Promise.reject(new Errors.InvalidDeckError("Deck has cards that are in hidden to collection"))
        if (gameSessionCard.getIsLegacy() || CardSetFactory.cardSetForIdentifier(gameSessionCard.getCardSetId()).isLegacy?) and GameType.getGameFormatForGameType(gameType) == GameFormat.Standard
          Logger.module("UsersModule").error "isAllowedToUseDeck() -> Deck has cards (#{gameSessionCard.id}) that are in LEGACY format but game mode is STANDARD format"
          return Promise.reject(new Errors.InvalidDeckError("Game Mode is STANDARD but deck contains LEGACY card"))

      if generalCount != 1
        return Promise.reject(new Errors.InvalidDeckError("Deck has " + generalCount + " generals"))

      # ensure that player has no more than 1 of a mythron card (normal + prismatic) in deck
      mythronCardCountsById = _.countBy(gameSessionCards, (card) ->
        if card.getRarityId() == SDK.Rarity.Mythron
          return Cards.getBaseCardId(card.getId())
        else
          return -1
      )
      for k,v of mythronCardCountsById
        if k != '-1' and v > 1
          return Promise.reject(new Errors.InvalidDeckError("Deck has more than 1 of a mythron card"))

      # ensure that player has no more than 1 trial card total
      trialCardCount = _.countBy(gameSessionCards, (card) ->
        baseCardId = Cards.getBaseCardId(card.getId())
        if baseCardId in [Cards.Faction1.RightfulHeir, Cards.Faction2.DarkHeart, Cards.Faction3.KeeperOfAges, Cards.Faction4.DemonOfEternity, Cards.Faction5.Dinomancer, Cards.Faction6.VanarQuest, Cards.Neutral.Singleton]
          return 'trialCard'
        else
          return -1
      )
      for k,v of trialCardCount
        if k != '-1' and v > 1
          return Promise.reject(new Errors.InvalidDeckError("Deck has more than 1 total trial card"))

      # setup method to validate cards against user inventory
      validateCards = () ->
        Logger.module("UsersModule").debug "isAllowedToUseDeck() -> doesUserHaveCards -> #{cardsToValidateAgainstInventory.length} cards to validate - #{userId.blue}.".green
        # if we're playing basic cards only, mark deck as valid, and only check against inventory otherwise
        if cardsToValidateAgainstInventory.length == 0
          return Promise.resolve(true)
        else
          return InventoryModule.isAllowedToUseCards(Promise.resolve(), knex, userId, cardsToValidateAgainstInventory)

      # setup method to validate skins against user inventory
      validateSkins = () ->
        Logger.module("UsersModule").debug "isAllowedToUseDeck() -> doesUserHaveSkins -> #{cardSkinsToValidateAgainstInventory.length} skins to validate - #{userId.blue}.".green
        if cardSkinsToValidateAgainstInventory.length == 0
          return Promise.resolve(true)
        else
          return InventoryModule.isAllowedToUseCosmetics(Promise.resolve(), knex, userId, cardSkinsToValidateAgainstInventory, SDK.CosmeticsTypeLookup.CardSkin)

      return Promise.all([
        validateCards(),
        validateSkins()
      ])
    else

      return Promise.reject(new Error("Unknown game type: #{gameType}"))

  ###*
  # Creates a blank faction progression (0 XP) record for a user. This is used to mark a faction as "unlocked".
  # @public
  # @param  {String}  userId      User ID for which to update.
  # @param  {String}  factionId     Faction ID for which to update.
  # @param  {String}  gameId      Game unique ID
  # @param  {String}  gameType    Game type (see SDK.GameType)
  # @param  {Moment}  systemTime    Pass in the current system time to use. Used only for testing.
  # @return  {Promise}          Promise that will notify when complete.
  ###
  @createFactionProgressionRecord: (userId,factionId,gameId,gameType,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not createFactionProgressionRecord(): invalid user ID - #{userId}"))

    # factionId must be defined
    if !factionId
      return Promise.reject(new Error("Can not createFactionProgressionRecord(): invalid faction ID - #{factionId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.resolve(tx('users').where('id',userId).first('id').forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx('user_faction_progression').where({'user_id':userId,'faction_id':factionId}).first().forUpdate()
        ])
      .spread (userRow,factionProgressionRow)->

        if factionProgressionRow
          throw new Errors.AlreadyExistsError()

        # faction progression row
        factionProgressionRow ?= { user_id:userId, faction_id:factionId }
        @.factionProgressionRow = factionProgressionRow
        factionProgressionRow.xp ?= 0
        factionProgressionRow.game_count ?= 0
        factionProgressionRow.unscored_count ?= 0
        factionProgressionRow.loss_count ?= 0
        factionProgressionRow.win_count ?= 0
        factionProgressionRow.draw_count ?= 0
        factionProgressionRow.single_player_win_count ?= 0
        factionProgressionRow.friendly_win_count ?= 0
        factionProgressionRow.xp_earned ?= 0
        factionProgressionRow.updated_at = MOMENT_NOW_UTC.toDate()
        factionProgressionRow.last_game_id = gameId
        factionProgressionRow.level = SDK.FactionProgression.levelForXP(factionProgressionRow.xp)

        # reward row
        rewardData = {
          id:generatePushId()
          user_id:userId
          reward_category:"faction unlock"
          game_id:gameId
          unlocked_faction_id:factionId
          created_at:MOMENT_NOW_UTC.toDate()
          is_unread:true
        }

        return Promise.all([
          tx('user_faction_progression').insert(factionProgressionRow)
          tx("user_rewards").insert(rewardData)
          GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id)
        ])
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        delete @.factionProgressionRow.user_id
        @.factionProgressionRow.updated_at = moment.utc(@.factionProgressionRow.updated_at).valueOf()
        return FirebasePromises.set(rootRef.child('user-faction-progression').child(userId).child(factionId).child('stats'),@.factionProgressionRow)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("UsersModule").error "createFactionProgressionRecord() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj

    return txPromise

  ###*
  # Update a user's per-faction progression metrics based on the outcome of a ranked game
  # @public
  # @param  {String}  userId      User ID for which to update.
  # @param  {String}  factionId     Faction ID for which to update.
  # @param  {Boolean}  isWinner    Did the user win the game?
  # @param  {String}  gameId      Game unique ID
  # @param  {String}  gameType    Game type (see SDK.GameType)
  # @param  {Boolean}  isUnscored    Should this game be scored or unscored (if a user conceded too early for example?)
  # @param  {Boolean}  isDraw      Are we updating for a draw?
  # @param  {Moment}  systemTime    Pass in the current system time to use. Used only for testing.
  # @return  {Promise}          Promise that will notify when complete.
  ###
  @updateUserFactionProgressionWithGameOutcome: (userId,factionId,isWinner,gameId,gameType,isUnscored,isDraw,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not updateUserFactionProgressionWithGameOutcome(): invalid user ID - #{userId}"))

    # factionId must be defined
    if !factionId
      return Promise.reject(new Error("Can not updateUserFactionProgressionWithGameOutcome(): invalid faction ID - #{factionId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.resolve(tx("users").first('id','is_bot').where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx('user_faction_progression').where({'user_id':userId,'faction_id':factionId}).first().forUpdate()
        ])
      .spread (userRow,factionProgressionRow)->

        # Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> ACQUIRED LOCK ON #{userId}".yellow

        @userRow = userRow

        allPromises = []

        needsInsert = _.isUndefined(factionProgressionRow)
        factionProgressionRow ?= {user_id:userId,faction_id:factionId}

        @.factionProgressionRow = factionProgressionRow
        factionProgressionRow.xp ?= 0
        factionProgressionRow.game_count ?= 0
        factionProgressionRow.unscored_count ?= 0
        factionProgressionRow.loss_count ?= 0
        factionProgressionRow.win_count ?= 0
        factionProgressionRow.draw_count ?= 0
        factionProgressionRow.single_player_win_count ?= 0
        factionProgressionRow.friendly_win_count ?= 0
        factionProgressionRow.level ?= 0

        # faction xp progression for single player and friendly games is capped at 11
        # levels are indexed from 0 so we check 10 here instead of 11
        if (gameType == GameType.SinglePlayer or gameType == GameType.BossBattle or gameType == GameType.Friendly) and factionProgressionRow.level >= 10
          throw new Errors.MaxFactionXPForSinglePlayerReachedError()

        # grab the default xp earned for a win/loss
#        xp_earned = if isWinner then SDK.FactionProgression.winXP else SDK.FactionProgression.lossXP
        xp_earned = SDK.FactionProgression.xpEarnedForGameOutcome(isWinner, factionProgressionRow.level)

        # if this game should not earn XP for some reason (early concede for example)
        if isUnscored then xp_earned = 0

        xp = factionProgressionRow.xp
        game_count = factionProgressionRow.game_count
        win_count = factionProgressionRow.win_count

        xp_cap = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel)

        # do not commit transaction if we're at the max level
        if (SDK.FactionProgression.levelForXP(xp) >= SDK.FactionProgression.maxLevel)
          xp_earned = 0
        # make sure user can't earn XP over cap
        else if (xp_cap - xp < xp_earned)
          xp_earned = xp_cap - xp

        factionProgressionRow.xp_earned = xp_earned
        factionProgressionRow.updated_at = MOMENT_NOW_UTC.toDate()
        factionProgressionRow.last_game_id = gameId

        if isUnscored
          unscored_count = factionProgressionRow.unscored_count
          factionProgressionRow.unscored_count += 1
        else
          factionProgressionRow.xp = xp + xp_earned
          factionProgressionRow.level = SDK.FactionProgression.levelForXP(factionProgressionRow.xp)
          factionProgressionRow.game_count += 1
          if isDraw
            factionProgressionRow.draw_count += 1
          else if isWinner
            factionProgressionRow.win_count += 1
            if gameType == GameType.SinglePlayer or gameType == GameType.BossBattle
              factionProgressionRow.single_player_win_count += 1
            if gameType == GameType.Friendly
              factionProgressionRow.friendly_win_count += 1
          else
            factionProgressionRow.loss_count += 1

        # Logger.module("UsersModule").debug factionProgressionRow

        if needsInsert
          allPromises.push knex('user_faction_progression').insert(factionProgressionRow).transacting(tx)
        else
          allPromises.push knex('user_faction_progression').where({'user_id':userId,'faction_id':factionId}).update(factionProgressionRow).transacting(tx)

        if !isUnscored and not @.factionProgressionRow.xp_earned > 0

          Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> F#{factionId} MAX level reached"

          # update the user game params
          @.updateUserGameParams =
            faction_xp: @.factionProgressionRow.xp
            faction_xp_earned: 0

          allPromises.push knex("user_games").where({'user_id':userId,'game_id':gameId}).update(@.updateUserGameParams).transacting(tx)

        else

          level = SDK.FactionProgression.levelForXP(@.factionProgressionRow.xp)

          Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> At F#{factionId} L:#{level} [#{@.factionProgressionRow.xp}] earned #{@.factionProgressionRow.xp_earned} for G:#{gameId}"

          progressData = {
            user_id:userId
            faction_id:factionId
            xp_earned:@.factionProgressionRow.xp_earned
            is_winner:isWinner || false
            is_draw:isDraw || false
            game_id:gameId
            created_at:MOMENT_NOW_UTC.toDate()
            is_scored:!isUnscored
          }

          @.updateUserGameParams =
            faction_xp: @.factionProgressionRow.xp - @.factionProgressionRow.xp_earned
            faction_xp_earned: @.factionProgressionRow.xp_earned

          allPromises.push knex("user_faction_progression_events").insert(progressData).transacting(tx)
          allPromises.push knex("user_games").where({'user_id':userId,'game_id':gameId}).update(@.updateUserGameParams).transacting(tx)

        return Promise.all(allPromises)
      .then ()->

        allPromises = []

        if (!isUnscored and @.factionProgressionRow) and SDK.FactionProgression.hasLeveledUp(@.factionProgressionRow.xp,@.factionProgressionRow.xp_earned)

          # Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> LEVELED up"

          factionName = SDK.FactionFactory.factionForIdentifier(factionId).devName
          level = SDK.FactionProgression.levelForXP(@.factionProgressionRow.xp)
          rewardData = SDK.FactionProgression.rewardDataForLevel(factionId,level)

          @.rewardRows = []

          if rewardData?

            rewardRowData =
              id: generatePushId()
              user_id: userId
              reward_category: 'faction xp'
              reward_type: "#{factionName} L#{level}"
              game_id: gameId
              created_at: MOMENT_NOW_UTC.toDate()
              is_unread:true

            @.rewardRows.push(rewardRowData)

            rewardData.created_at = MOMENT_NOW_UTC.valueOf()
            rewardData.level = level

            # update inventory
            earnRewardInventoryPromise = null
            if rewardData.gold?

              rewardRowData.gold = rewardData.gold

              # update wallet
              earnRewardInventoryPromise = InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,"#{factionName} L#{level}",gameId)

            else if rewardData.spirit?

              rewardRowData.spirit = rewardData.spirit

              # update wallet
              earnRewardInventoryPromise = InventoryModule.giveUserSpirit(txPromise,tx,userId,rewardData.spirit,"#{factionName} L#{level}",gameId)

            else if rewardData.cards?

              cardIds = []
              _.each(rewardData.cards,(c)->
                _.times c.count, ()->
                  cardIds.push(c.id)
              )

              rewardRowData.cards = cardIds

              # give cards
              earnRewardInventoryPromise = InventoryModule.giveUserCards(txPromise,tx,userId,cardIds,'faction xp',gameId,"#{factionName} L#{level}")

            else if rewardData.booster_packs?

              rewardRowData.spirit_orbs = rewardData.booster_packs

              # TODO: what about more than 1 booster pack?
              earnRewardInventoryPromise = InventoryModule.addBoosterPackToUser(txPromise,tx,userId,1,"faction xp","#{factionName} L#{level}",{factionId:factionId,level:level,gameId:gameId})

            else if rewardData.emotes?

              rewardRowData.cosmetics = []

              # update emotes inventory
              emotes_promises = []
              for emote_id in rewardData.emotes
                rewardRowData.cosmetics.push(emote_id)
                allPromises.push InventoryModule.giveUserCosmeticId(txPromise, tx, userId, emote_id, "faction xp reward", rewardRowData.id,null, MOMENT_NOW_UTC)

              earnRewardInventoryPromise = Promise.all(emotes_promises)

            # resolve master promise whan reward is saved and inventory updated
            allPromises = allPromises.concat [
              knex("user_rewards").insert(rewardRowData).transacting(tx),
              earnRewardInventoryPromise,
              GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardRowData.id)
            ]

        # let's see if we need to add any faction ribbons for this user
        winCountForRibbons = @.factionProgressionRow.win_count - (@.factionProgressionRow.single_player_win_count + @.factionProgressionRow.friendly_win_count)
        if isWinner and winCountForRibbons > 0 and winCountForRibbons % 100 == 0 and not @.userRow.is_bot

          Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> user #{userId.blue}".green + " game #{gameId} earned WIN RIBBON for faction #{factionId}"

          ribbonId = "f#{factionId}_champion"

          rewardRowData =
            id: generatePushId()
            user_id: userId
            reward_category: 'ribbon'
            reward_type: "#{factionName} wins"
            game_id: gameId
            created_at: MOMENT_NOW_UTC.toDate()
            ribbons:[ribbonId]
            is_unread:true

          # looks like the user earned a faction ribbon!
          ribbon =
            user_id:userId
            ribbon_id:ribbonId
            game_id:gameId
            created_at:MOMENT_NOW_UTC.toDate()

          @.ribbon = ribbon

          allPromises = allPromises.concat [
            knex("user_ribbons").insert(ribbon).transacting(tx)
            knex("user_rewards").insert(rewardRowData).transacting(tx),
            GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardRowData.id)
          ]

        return Promise.all(allPromises)
      .then ()->
        # Update quests if a faction has leveled up
        if SDK.FactionProgression.hasLeveledUp(@.factionProgressionRow.xp,@.factionProgressionRow.xp_earned)
          if @.factionProgressionRow #and shouldProcessQuests # TODO: shouldprocessquests? also this may fail for people who already have faction lvl 10 by the time they reach this stage
            return QuestsModule.updateQuestProgressWithProgressedFactionData(txPromise,tx,userId,@.factionProgressionRow,MOMENT_NOW_UTC)

        # Not performing faction based quest update
        return Promise.resolve()
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->

        @.fbRootRef = rootRef

        allPromises = []

        delete @.factionProgressionRow.user_id
        @.factionProgressionRow.updated_at = moment.utc(@.factionProgressionRow.updated_at).valueOf()

        allPromises.push FirebasePromises.set(rootRef.child('user-faction-progression').child(userId).child(factionId).child('stats'),@.factionProgressionRow)

        for key,val of @.updateUserGameParams
          allPromises.push FirebasePromises.set(rootRef.child('user-games').child(userId).child(gameId).child(key),val)

        if @.ribbon
          ribbonData = _.omit(@.ribbon,["user_id"])
          ribbonData = DataAccessHelpers.restifyData(ribbonData)
          allPromises.push FirebasePromises.safeTransaction(rootRef.child('user-ribbons').child(userId).child(ribbonData.ribbon_id),(data)->
            data ?= {}
            data.ribbon_id ?= ribbonData.ribbon_id
            data.updated_at = ribbonData.created_at
            data.count ?= 0
            data.count += 1
            return data
          )

        # if @.rewardRows
        #   for reward in @.rewardRows
        #     reward_id = reward.id
        #     delete reward.user_id
        #     delete reward.id
        #     reward.created_at = moment.utc(reward.created_at).valueOf()
        #     # push rewards to firebase tree
        #     allPromises.push(FirebasePromises.set(rootRef.child("user-rewards").child(userId).child(reward_id),reward))

        return Promise.all(allPromises)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .catch Errors.MaxFactionXPForSinglePlayerReachedError, (e)-> tx.rollback(e)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("UsersModule").error "updateUserFactionProgressionWithGameOutcome() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    .then ()->
      # Update achievements if leveled up
      if SDK.FactionProgression.hasLeveledUp(@.factionProgressionRow.xp,@.factionProgressionRow.xp_earned) || @.factionProgressionRow.game_count == 1
        Jobs.create("update-user-achievements",
          name: "Update User Faction Achievements"
          title: util.format("User %s :: Update Faction Achievements", userId)
          userId: userId
          factionProgressed: true
        ).removeOnComplete(true).save()

      Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> user #{userId.blue}".green + " game #{gameId} (#{@.factionProgressionRow["game_count"]}) faction progression recorded. Unscored: #{isUnscored?.toString().cyan}".green
      return @.factionProgressionRow
    .catch Errors.MaxFactionXPForSinglePlayerReachedError, (e)->
      Logger.module("UsersModule").debug "updateUserFactionProgressionWithGameOutcome() -> user #{userId.blue}".green + " game #{gameId} for faction #{factionId} not recorded. MAX LVL 11 for single player games reached."
      return null
    .finally ()-> return GamesModule.markClientGameJobStatusAsComplete(userId,gameId,'faction_progression')
    return txPromise

  ###*
  # Update a user's progression metrics based on the outcome of a ranked game
  # @public
  # @param  {String}  userId    User ID for which to update.
  # @param  {Boolean}  isWinner  Did the user win the game?
  # @param  {String}  gameId    Game unique ID
  # @param  {String}  gameType  Game type (see SDK.GameType)
  # @param  {Boolean}  isUnscored  Should this game be scored or unscored if the user, for example, conceded too early?
  # @param  {Boolean}  isDraw  is this game a draw?
  # @param  {Moment}  systemTime  Pass in the current system time to use. Used only for testing.
  # @return  {Promise}        Promise that will notify when complete.
  ###
  @updateUserProgressionWithGameOutcome: (userId,opponentId,isWinner,gameId,gameType,isUnscored,isDraw,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not updateUserProgressionWithGameOutcome(): invalid user ID - #{userId}"))

    # userId must be defined
    if !gameId
      return Promise.reject(new Error("Can not updateUserProgressionWithGameOutcome(): invalid game ID - #{gameId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    this_obj = {}

    txPromise = knex.transaction (tx)->

      start_of_day_int = parseInt(moment(MOMENT_NOW_UTC).startOf('day').utc().format("YYYYMMDD"))

      return Promise.resolve(tx("users").first('id').where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx('user_progression').where('user_id',userId).first().forUpdate()
          tx('user_progression_days').where({'user_id':userId,'date':start_of_day_int}).first().forUpdate()
        ])
      .spread (userRow,progressionRow,progressionDayRow)->

        # Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> ACQUIRED LOCK ON #{userId}".yellow

        #######
        #######
        #######
        #######
        #######
        #######
        #######

        allPromises = []

        hasReachedDailyPlayRewardMaxium = false
        hasReachedDailyWinRewardMaxium = false
        @.hasReachedDailyWinCountBonusLimit = false
        canEarnFirstWinOfTheDayReward = true

        @.progressionDayRow = progressionDayRow || { user_id:userId, date:start_of_day_int }
        @.progressionDayRow.game_count ?= 0
        @.progressionDayRow.unscored_count ?= 0
        @.progressionDayRow.game_count += 1

        # controls for daily maximum of play rewards
        if @.progressionDayRow.game_count - @.progressionDayRow.unscored_count > UsersModule.DAILY_REWARD_GAME_CAP
          hasReachedDailyPlayRewardMaxium = true

        # # controls for daily maximum of play rewards
        # if counterData.win_count > UsersModule.DAILY_REWARD_WIN_CAP
        #   hasReachedDailyWinRewardMaxium = true

        if isDraw

          @.progressionDayRow.draw_count ?= 0
          @.progressionDayRow.draw_count += 1

        else if isWinner

          # iterate win count
          @.progressionDayRow.win_count ?= 0
          @.progressionDayRow.win_count += 1

          if @.progressionDayRow.win_count > 1
            canEarnFirstWinOfTheDayReward = false

          # @.hasReachedDailyWinCountBonusLimit is disabled
#          if @.progressionDayRow.win_count > 14
#            @.hasReachedDailyWinCountBonusLimit = true

        else
          # iterate loss count
          @.progressionDayRow.loss_count ?= 0
          @.progressionDayRow.loss_count += 1

        # if it's an unscored game, iterate unscored counter
        if isUnscored
          @.progressionDayRow.unscored_count += 1

        if progressionDayRow?
          allPromises.push knex('user_progression_days').where({'user_id':userId,'date':start_of_day_int}).update(@.progressionDayRow).transacting(tx)
        else
          allPromises.push knex('user_progression_days').insert(@.progressionDayRow).transacting(tx)


        #######
        #######
        #######
        #######
        #######
        #######
        #######

        @.hasEarnedWinReward = false
        @.hasEarnedPlayReward = false
        @.hasEarnedFirstWinOfTheDayReward = false

        @.progressionRow = progressionRow || { user_id:userId }
        @.progressionRow.last_opponent_id = opponentId

        # record total game count
        @.progressionRow.game_count ?= 0
        @.progressionRow.unscored_count ?= 0
        @.progressionRow.last_game_id = gameId || null
        @.progressionRow.updated_at = MOMENT_NOW_UTC.toDate()

        # initialize last award records
        @.progressionRow.last_awarded_game_count ?= 0
        @.progressionRow.last_awarded_win_count ?= 0
        last_daily_win_at = @.progressionRow.last_daily_win_at || 0

        play_count_reward_progress = 0
        win_count_reward_progress = 0

        if isUnscored

          @.progressionRow.unscored_count += 1

          # mark all rewards as false
          @.hasEarnedWinReward = false
          @.hasEarnedPlayReward = false
          @.hasEarnedFirstWinOfTheDayReward = false

        else

          @.progressionRow.game_count += 1

          if not hasReachedDailyPlayRewardMaxium

            play_count_reward_progress = @.progressionRow.game_count - @.progressionRow.last_awarded_game_count

            if @.progressionRow.game_count > 0 and play_count_reward_progress > 0 and play_count_reward_progress % 4 == 0
              @.progressionRow.last_awarded_game_count = @.progressionRow.game_count
              @.hasEarnedPlayReward = true
            else
              @.hasEarnedPlayReward = false
          else

            @.progressionRow.last_awarded_game_count = @.progressionRow.game_count
            @.progressionRow.play_awards_last_maxed_at = MOMENT_NOW_UTC.toDate()
            @.hasEarnedPlayReward = false

          if isDraw

            @.progressionRow.draw_count ?= 0
            @.progressionRow.draw_count += 1

          else if isWinner

            # set loss streak to 0
            @.progressionRow.loss_streak = 0

            # is this the first win of the day?
            hours_since_last_win = MOMENT_NOW_UTC.diff(last_daily_win_at,'hours')
            if hours_since_last_win >= UsersModule.DAILY_WIN_CYCLE_HOURS
              @.hasEarnedFirstWinOfTheDayReward = true
              @.progressionRow.last_daily_win_at = MOMENT_NOW_UTC.toDate()
            else
              @.hasEarnedFirstWinOfTheDayReward = false

            # iterate win count
            @.progressionRow.win_count ?= 0
            @.progressionRow.win_count += 1
            # iterate win streak
            if gameType != GameType.Casual
              @.progressionRow.win_streak ?= 0
              @.progressionRow.win_streak += 1
            # mark last win time
            @.progressionRow.last_win_at = MOMENT_NOW_UTC.toDate()

            if not hasReachedDailyWinRewardMaxium

              win_count_reward_progress = @.progressionRow.win_count - @.progressionRow.last_awarded_win_count

              # if we've had 3 wins since last award, the user has earned an award
              if @.progressionRow.win_count - @.progressionRow.last_awarded_win_count >= CONFIG.WINS_REQUIRED_FOR_WIN_REWARD
                @.hasEarnedWinReward = true
                @.progressionRow.last_awarded_win_count_at = MOMENT_NOW_UTC.toDate()
                @.progressionRow.last_awarded_win_count = @.progressionRow.win_count
              else
                @.hasEarnedWinReward = false
            else
              @.progressionRow.last_awarded_win_count_at = MOMENT_NOW_UTC.toDate()
              @.progressionRow.win_awards_last_maxed_at = MOMENT_NOW_UTC.toDate()
              @.progressionRow.last_awarded_win_count = @.progressionRow.win_count
              @.hasEarnedWinReward = false

          else
            # iterate loss count
            @.progressionRow.loss_count ?= 0
            @.progressionRow.loss_count += 1

            # only iterate loss streak for scored games
            # NOTE: control flow should never allow this to be reached for unscored, but adding this just in case someone moves code around :)
            if not isUnscored
              @.progressionRow.loss_streak ?= 0
              @.progressionRow.loss_streak += 1

            if gameType != GameType.Casual
              # reset win streak
              @.progressionRow.win_streak = 0

        if progressionRow?
          allPromises.push knex('user_progression').where({'user_id':userId}).update(@.progressionRow).transacting(tx)
        else
          allPromises.push knex('user_progression').insert(@.progressionRow).transacting(tx)


        @.updateUserGameParams =
          is_daily_win:          @.hasEarnedWinReward
          play_count_reward_progress:    play_count_reward_progress
          win_count_reward_progress:    win_count_reward_progress
          has_maxed_play_count_rewards:  hasReachedDailyPlayRewardMaxium
          has_maxed_win_count_rewards:  hasReachedDailyWinRewardMaxium
        allPromises.push knex('user_games').where({'user_id':userId,'game_id':gameId}).update(@.updateUserGameParams).transacting(tx)

        return Promise.all(allPromises)
      .then ()->

        hasEarnedWinReward = @.hasEarnedWinReward
        hasEarnedPlayReward = @.hasEarnedPlayReward
        hasEarnedFirstWinOfTheDayReward = @.hasEarnedFirstWinOfTheDayReward

        # let's set up
        promises = []
        @.rewards = []

        # if the game is "unscored", assume there are NO rewards
        # otherwise, the game counter rewards might fire multiple times since game_count is not updated for unscored games
        if not isUnscored

          if hasEarnedFirstWinOfTheDayReward

            Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue} HAS earned a FIRST-WIN-OF-THE-DAY reward at #{@.progressionRow["game_count"]} games!"

            # set up reward data
            rewardData = {
              id:generatePushId()
              user_id:userId
              game_id:gameId
              reward_category:"progression"
              reward_type:"daily win"
              gold:CONFIG.FIRST_WIN_OF_DAY_GOLD_REWARD
              created_at:MOMENT_NOW_UTC.toDate()
              is_unread:true
            }

            # add it to the rewards array
            @.rewards.push(rewardData)

            # add the promise to our list of reward promises
            promises.push(knex("user_rewards").insert(rewardData).transacting(tx))
            promises.push(InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,rewardData.reward_type))
            promises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

          # if hasEarnedPlayReward

          #   Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue} HAS earned a PLAY-COUNT reward at #{@.progressionRow["game_count"]} games!"

          #   # set up reward data
          #   rewardData = {
          #     id:generatePushId()
          #     user_id:userId
          #     game_id:gameId
          #     reward_category:"progression"
          #     reward_type:"play count"
          #     gold:10
          #     created_at:MOMENT_NOW_UTC.toDate()
          #     is_unread:true
          #   }

          #   # add it to the rewards array
          #   @.rewards.push(rewardData)

          #   # add the promise to our list of reward promises
          #   promises.push(knex("user_rewards").insert(rewardData).transacting(tx))
          #   promises.push(InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,rewardData.reward_type))
          #   promises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

          # if @.progressionRow["game_count"] == 3 and not isUnscored

          #   Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue} HAS earned a FIRST-3-GAMES reward!"

          #   # set up reward data
          #   rewardData = {
          #     id:generatePushId()
          #     user_id:userId
          #     game_id:gameId
          #     reward_category:"progression"
          #     reward_type:"first 3 games"
          #     gold:100
          #     created_at:MOMENT_NOW_UTC.toDate()
          #     is_unread:true
          #   }

          #   # add it to the rewards array
          #   @.rewards.push(rewardData)

          #   # add the promise to our list of reward promises
          #   promises.push(knex("user_rewards").insert(rewardData).transacting(tx))
          #   promises.push(InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,rewardData.reward_type))
          #   promises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

          # if @.progressionRow["game_count"] == 10 and not isUnscored

          #   Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue} HAS earned a FIRST-10-GAMES reward!"

          #   # set up reward data
          #   reward = {
          #     type:"first 10 games"
          #     gold_amount:100
          #     created_at:MOMENT_NOW_UTC.toDate()
          #     is_unread:true
          #   }

          #   # set up reward data
          #   rewardData = {
          #     id:generatePushId()
          #     user_id:userId
          #     game_id:gameId
          #     reward_category:"progression"
          #     reward_type:"first 10 games"
          #     gold:100
          #     created_at:MOMENT_NOW_UTC.toDate()
          #     is_unread:true
          #   }

          #   # add it to the rewards array
          #   @.rewards.push(rewardData)

          #   # add the promise to our list of reward promises
          #   promises.push(knex("user_rewards").insert(rewardData).transacting(tx))
          #   promises.push(InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,rewardData.reward_type))
          #   promises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

          if hasEarnedWinReward

            gold_amount = CONFIG.WIN_BASED_GOLD_REWARD
            # hasReachedDailyWinCountBonusLimit is disabled
            if @.hasReachedDailyWinCountBonusLimit
              gold_amount = 5

            Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue} HAS earned a #{gold_amount}G WIN-COUNT reward!"

            # set up reward data
            rewardData = {
              id:generatePushId()
              user_id:userId
              game_id:gameId
              reward_category:"progression"
              reward_type:"win count"
              gold:gold_amount
              created_at:MOMENT_NOW_UTC.toDate()
              is_unread:true
            }

            # add it to the rewards array
            @.rewards.push(rewardData)

            # add the promise to our list of reward promises
            promises.push(knex("user_rewards").insert(rewardData).transacting(tx))
            promises.push(InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,rewardData.reward_type))
            promises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

          @.codexChapterIdsEarned = SDK.Codex.chapterIdsAwardedForGameCount(@.progressionRow.game_count)

          if @.codexChapterIdsEarned && @.codexChapterIdsEarned.length != 0
            Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue} HAS earned codex chapters #{@.codexChapterIdsEarned} reward!"
            for codexChapterIdEarned in @.codexChapterIdsEarned
              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                game_id:gameId
                reward_category:"codex"
                reward_type:"game count"
                codex_chapter:codexChapterIdEarned
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              promises.push(InventoryModule.giveUserCodexChapter(txPromise,tx,userId,codexChapterIdEarned,MOMENT_NOW_UTC))
              promises.push(knex("user_rewards").insert(rewardData).transacting(tx))
              promises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

          return Promise.all(promises)
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->

        @.fbRootRef = rootRef

        allPromises = []

        delete @.progressionRow.user_id
        delete @.progressionRow.last_opponent_id

        if @.progressionRow.last_win_at then @.progressionRow.last_win_at = moment.utc(@.progressionRow.last_win_at).valueOf()
        if @.progressionRow.last_daily_win_at then @.progressionRow.last_daily_win_at = moment.utc(@.progressionRow.last_daily_win_at).valueOf()
        if @.progressionRow.last_awarded_win_count_at then @.progressionRow.last_awarded_win_count_at = moment.utc(@.progressionRow.last_awarded_win_count_at).valueOf()
        if @.progressionRow.play_awards_last_maxed_at then @.progressionRow.play_awards_last_maxed_at = moment.utc(@.progressionRow.play_awards_last_maxed_at).valueOf()
        if @.progressionRow.win_awards_last_maxed_at then @.progressionRow.win_awards_last_maxed_at = moment.utc(@.progressionRow.win_awards_last_maxed_at).valueOf()
        if @.progressionRow.updated_at then @.progressionRow.updated_at = moment.utc().valueOf(@.progressionRow.updated_at)

        allPromises.push FirebasePromises.set(rootRef.child("user-progression").child(userId).child('game-counter'),@.progressionRow)

        for key,val of @.updateUserGameParams
          allPromises.push FirebasePromises.set(rootRef.child('user-games').child(userId).child(gameId).child(key),val)

        # for reward in @.rewards

        #   rewardId = reward.id
        #   delete reward.id
        #   delete reward.user_id
        #   if reward.created_at then moment.utc().valueOf(reward.created_at)

        #   allPromises.push FirebasePromises.set(rootRef.child("user-rewards").child(userId).child(rewardId),reward)

        return Promise.all(allPromises)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("UsersModule").error "updateUserProgressionWithGameOutcome() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    .then ()-> Logger.module("UsersModule").debug "updateUserProgressionWithGameOutcome() -> user #{userId.blue}".green + " game #{gameId} G:#{@.progressionRow["game_count"]} W:#{@.progressionRow["win_count"]} L:#{@.progressionRow["loss_count"]} U:#{@.progressionRow["unscored_count"]} progression recorded. Unscored: #{isUnscored?.toString().cyan}".green
    .finally ()-> return GamesModule.markClientGameJobStatusAsComplete(userId,gameId,'progression')

    return txPromise

  ###*
  # Update a user's boss progression outcome of a boss battle
  # @public
  # @param  {String}  userId    User ID for which to update.
  # @param  {Boolean}  isWinner  Did the user win the game?
  # @param  {String}  gameId    Game unique ID
  # @param  {String}  gameType  Game type (see SDK.GameType)
  # @param  {Boolean}  isUnscored  Should this game be scored or unscored if the user, for example, conceded too early?
  # @param  {Boolean}  isDraw  is this game a draw?
  # @param {Object} gameSessionData data for the game played
  # @param  {Moment}  systemTime  Pass in the current system time to use. Used only for testing.
  # @return  {Promise}        Promise that will notify when complete.
  ###
  @updateUserBossProgressionWithGameOutcome: (userId,opponentId,isWinner,gameId,gameType,isUnscored,isDraw,gameSessionData,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not updateUserBossProgressionWithGameOutcome(): invalid user ID - #{userId}"))

    # userId must be defined
    if !gameId
      return Promise.reject(new Error("Can not updateUserBossProgressionWithGameOutcome(): invalid game ID - #{gameId}"))

    if !gameType? or gameType != SDK.GameType.BossBattle
      return Promise.reject(new Error("Can not updateUserBossProgressionWithGameOutcome(): invalid game game type - #{gameType}"))

    if !isWinner
      return Promise.resolve(false)

    # Oppenent general must be part of the boss faction
    opponentPlayerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSessionData,opponentId)
    bossId = opponentPlayerSetupData?.generalId
    sdkBossData = SDK.GameSession.getCardCaches().getCardById(bossId)

    if (not bossId?) or (not sdkBossData?) or (sdkBossData.getFactionId() != SDK.Factions.Boss)
      return Promise.reject(new Error("Can not updateUserBossProgressionWithGameOutcome(): invalid boss ID - #{gameId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    this_obj = {}
    this_obj.rewards = []

    txPromise = knex.transaction (tx)->

      return Promise.resolve(tx("users").first('id').where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow) ->
        @.userRow = userRow
        return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->

        @.fbRootRef = fbRootRef

        bossEventsRef = @.fbRootRef.child("boss-events")
        return FirebasePromises.once(bossEventsRef,'value')
      .then (bossEventsSnapshot)->
        bossEventsData = bossEventsSnapshot.val()
        # eventData contains:
        #    event_id
        #    boss_id
        #    event_start
        #    event_end
        #    valid_end (event_end + 30 minute buffer)
        @.matchingEventData = null
        for eventId, eventData of bossEventsData
          if !eventData.boss_id? or parseInt(eventData.boss_id) != bossId
            continue
          if !eventData.event_start? or eventData.event_start > MOMENT_NOW_UTC.valueOf()
            continue
          if !eventData.valid_end? or eventData.valid_end < MOMENT_NOW_UTC.valueOf()
            continue

          # Reaching here means we have a matching event
          @.matchingEventData = eventData
          @.matchingEventId = eventData.event_id
          break

        if not @.matchingEventData?
          Logger.module("UsersModule").debug "updateUserBossProgressionWithGameOutcome() -> no matching boss event id for user #{userId} in game #{gameId}.".red
          return Promise.reject(new Error("Can not updateUserBossProgressionWithGameOutcome(): No matching boss event - #{gameId}"))
      .then ()->
        return Promise.all([
          @.userRow,
          tx('user_bosses_defeated').where('user_id',userId).andWhere("boss_id",bossId).andWhere("boss_event_id",@.matchingEventId).first()
        ])
      .spread (userRow,userBossDefeatedRow)->

        if (userBossDefeatedRow?)
          return Promise.resolve()

        allPromises = []

        # Insert defeated boss row
        defeatedBossData =
          user_id: userId
          boss_id: bossId
          game_id: gameId
          boss_event_id: @.matchingEventId
          defeated_at: MOMENT_NOW_UTC.toDate()
        allPromises.push(tx('user_bosses_defeated').insert(defeatedBossData))

        Logger.module("UsersModule").debug "updateUserBossProgressionWithGameOutcome() -> user #{userId.blue} HAS earned a BOSS BATTLE reward!"

        # set up reward data
        rewardData = {
          id:generatePushId()
          user_id:userId
          game_id:gameId
          reward_category:"progression"
          reward_type:"boss battle"
          spirit_orbs:SDK.CardSet.Core
          created_at:MOMENT_NOW_UTC.toDate()
          is_unread:true
        }

        # add it to the rewards array
        @.rewards.push(rewardData)

        # add the promise to our list of reward promises
        allPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))
#        allPromises.push(InventoryModule.giveUserGold(txPromise,tx,userId,rewardData.gold,rewardData.reward_type))
        allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,rewardData.spirit_orbs,"boss battle",@.matchingEventId))
        allPromises.push(GamesModule._addRewardIdToUserGame(tx,userId,gameId,rewardData.id))

        return Promise.all(allPromises)

      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->

        @.fbRootRef = rootRef

        allPromises = []

        # Insert defeated boss row
        defeatedBossFBData =
          boss_id: bossId
          boss_event_id: @.matchingEventId
          defeated_at: MOMENT_NOW_UTC.valueOf()

        allPromises.push FirebasePromises.set(rootRef.child("user-bosses-defeated").child(userId).child(bossId),defeatedBossFBData)

        return Promise.all(allPromises)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("UsersModule").error "updateUserBossProgressionWithGameOutcome() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    .then ()-> Logger.module("UsersModule").debug "updateUserBossProgressionWithGameOutcome() -> user #{userId.blue}".green + " game #{gameId} boss id:#{bossId}".green
    .finally ()-> return GamesModule.markClientGameJobStatusAsComplete(userId,gameId,'progression')

    return txPromise

  ###*
  # Update a user's game counters
  # @public
  # @param  {String}      userId    User ID for which to update.
  # @param  {Number}      factionId   Faction ID for which to update.
  # @param  {Number}      generalId   General ID for which to update.
  # @param  {Boolean}      isWinner  Did the user win the game?
  # @param  {String}      gameType  Game type (see SDK.GameType)
  # @param  {Boolean}      isUnscored  Should this game be scored or unscored if the user, for example, conceded too early?
  # @param  {Boolean}      isDraw  was game a draw?
  # @param  {Moment}      systemTime  Pass in the current system time to use. Used only for testing.
  # @return  {Promise}            Promise that will notify when complete.
  ###
  @updateGameCounters: (userId,factionId,generalId,isWinner,gameType,isUnscored,isDraw,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not updateUserProgressionWithGameOutcome(): invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    MOMENT_SEASON_START_UTC = MOMENT_NOW_UTC.clone().startOf('month')
    this_obj = {}

    return knex.transaction (tx)->
      return Promise.resolve(tx("users").first('id').where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx('user_game_counters').where({
            'user_id':    userId
            'game_type':  gameType
          }).first().forUpdate(),
          tx('user_game_faction_counters').where({
            'user_id':    userId
            'faction_id':  factionId
            'game_type':  gameType
          }).first().forUpdate(),
          tx('user_game_general_counters').where({
            'user_id':    userId
            'general_id':  generalId
            'game_type':  gameType
          }).first().forUpdate(),
          tx('user_game_season_counters').where({
            'user_id':        userId
            'season_starting_at':  MOMENT_SEASON_START_UTC.toDate()
            'game_type':      gameType
          }).first().forUpdate()
        ])
      .spread (userRow,counterRow,factionCounterRow,generalCounterRow,seasonCounterRow)->

        allPromises = []

        # game type counter
        counter = DataAccessHelpers.updateCounterWithGameOutcome(counterRow,isWinner,isDraw,isUnscored)
        counter.user_id = userId
        counter.game_type = gameType
        counter.created_at ?= MOMENT_NOW_UTC.toDate()
        counter.updated_at = MOMENT_NOW_UTC.toDate()

        if counterRow
          allPromises.push knex('user_game_counters').where({
            'user_id':    userId
            'game_type':  gameType
          }).update(counter).transacting(tx)
        else
          allPromises.push knex('user_game_counters').insert(counter).transacting(tx)


        # faction counter
        factionCounter = DataAccessHelpers.updateCounterWithGameOutcome(factionCounterRow,isWinner,isDraw,isUnscored)
        factionCounter.user_id = userId
        factionCounter.faction_id = factionId
        factionCounter.game_type = gameType
        factionCounter.created_at ?= MOMENT_NOW_UTC.toDate()
        factionCounter.updated_at = MOMENT_NOW_UTC.toDate()

        if factionCounterRow
          allPromises.push knex('user_game_faction_counters').where({
            'user_id':    userId
            'faction_id':  factionId
            'game_type':  gameType
          }).update(factionCounter).transacting(tx)
        else
          allPromises.push knex('user_game_faction_counters').insert(factionCounter).transacting(tx)

        # general counter
        generalCounter = DataAccessHelpers.updateCounterWithGameOutcome(generalCounterRow,isWinner,isDraw,isUnscored)
        generalCounter.user_id = userId
        generalCounter.general_id = generalId
        generalCounter.game_type = gameType
        generalCounter.created_at ?= MOMENT_NOW_UTC.toDate()
        generalCounter.updated_at = MOMENT_NOW_UTC.toDate()

        if generalCounterRow
          allPromises.push knex('user_game_general_counters').where({
            'user_id':    userId
            'general_id':  generalId
            'game_type':  gameType
          }).update(generalCounter).transacting(tx)
        else
          allPromises.push knex('user_game_general_counters').insert(generalCounter).transacting(tx)

        # season counter
        seasonCounter = DataAccessHelpers.updateCounterWithGameOutcome(seasonCounterRow,isWinner,isDraw,isUnscored)
        seasonCounter.user_id = userId
        seasonCounter.game_type = gameType
        seasonCounter.season_starting_at ?= MOMENT_SEASON_START_UTC.toDate()
        seasonCounter.created_at ?= MOMENT_NOW_UTC.toDate()
        seasonCounter.updated_at = MOMENT_NOW_UTC.toDate()

        if seasonCounterRow
          allPromises.push knex('user_game_season_counters').where({
            'user_id':        userId
            'season_starting_at':  MOMENT_SEASON_START_UTC.toDate()
            'game_type':      gameType
          }).update(seasonCounter).transacting(tx)
        else
          allPromises.push knex('user_game_season_counters').insert(seasonCounter).transacting(tx)

        @.counter = counter
        @.factionCounter = factionCounter
        @.generalCounter = generalCounter
        @.seasonCounter = seasonCounter

        return Promise.all(allPromises)
      # .then ()-> return DuelystFirebase.connect().getRootRef()
      # .then (rootRef)->

      #   allPromises = []

      #   firebaseCounterData = DataAccessHelpers.restifyData _.clone(@.counter)
      #   delete firebaseCounterData.user_id
      #   delete firebaseCounterData.game_type

      #   firebaseFactionCounterData = DataAccessHelpers.restifyData _.clone(@.factionCounter)
      #   delete firebaseFactionCounterData.user_id
      #   delete firebaseFactionCounterData.faction_id
      #   delete firebaseFactionCounterData.game_type

      #   allPromises.push FirebasePromises.update(rootRef.child('user-game-counters').child(userId).child(gameType).child('stats'),firebaseCounterData)
      #   allPromises.push FirebasePromises.update(rootRef.child('user-game-counters').child(userId).child(gameType).child('factions').child(factionId),firebaseFactionCounterData)

      #   return Promise.all(allPromises)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("UsersModule").error "updateGameCounters() -> ERROR, operation timeout for u:#{userId}"
        throw e

    .bind this_obj
    .then ()->
      Logger.module("UsersModule").debug "updateGameCounters() -> updated #{gameType} game counters for #{userId.blue}"
      return {
        counter:@.counter
        faction_counter:@.factionCounter
        general_counter:@.generalCounter
        season_counter:@.seasonCounter
      }

  ###*
  # Update user's stats given a game.
  # @public
  # @param  {String}  userId    User ID for which to process quests.
  # @param  {String}  gameId    Game ID for which to calculate stat changes
  # @param  {String}  gameType  Game type (see SDK.GameType)
  # @param  {String}  gameData  Plain object with game data
  # @return  {Promise}        Promise that will post STATDATA on completion.
  ###
  @updateUserStatsWithGame: (userId,gameId,gameType,gameData,systemTime) ->
    # userId must be defined
    if !userId or !gameId
      return Promise.reject(new Error("Can not update user-stats : invalid user ID - #{userId} - or game ID - #{gameId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()

    # Begin the promise rabbit hole
    return DuelystFirebase.connect().getRootRef()
    .bind {}
    .then (fbRootRef) ->
      @fbRootRef = fbRootRef
      statsRef = @fbRootRef.child("user-stats").child(userId)

      return new Promise (resolve, reject) ->
        statsRef.once("value", (statsSnapshot) ->
          return resolve(statsSnapshot.val())
        )
    .then (statsData) ->
      try
        playerData = UtilsGameSession.getPlayerDataForId(gameData,userId)
        playerSetupData = UtilsGameSession.getPlayerSetupDataForPlayerId(gameData,userId)
        isWinner = playerData.isWinner
        statsRef = @fbRootRef.child("user-stats").child(userId)

        if !statsData
          statsData = {}

        # TODO: Temp until we have queue type defined in an architecture
        queueName = gameType

        if !statsData[queueName]
          statsData[queueName] = {}
        queueStatsData = statsData[queueName]

        # -- First per queue stats
        # Update player's global win streak
        queueStatsData.winStreak ?= 0
        if gameType != GameType.Casual
          if isWinner
            queueStatsData.winStreak += 1
          else
            queueStatsData.winStreak = 0

        # -- Then per faction data
        factionId = playerSetupData.factionId
        if !queueStatsData[factionId]
          queueStatsData[factionId] = {}
        factionStatsData = queueStatsData[factionId]
        factionStatsData.factionId = factionId

        # Update per faction win count and play count
        factionStatsData.playCount = (factionStatsData.playCount or 0) + 1
        if (isWinner)
          factionStatsData.winCount = (factionStatsData.winCount or 0) + 1

        # Update cards played counts
        if !factionStatsData.cardsPlayedCounts
          factionStatsData.cardsPlayedCounts = {}

        cardIndices = Object.keys(gameData.cardsByIndex)
        for cardIndex in cardIndices
          card = gameData.cardsByIndex[cardIndex]
          if card.ownerId == userId
            factionStatsData.cardsPlayedCounts[card.id] = (factionStatsData.cardsPlayedCounts[card.id] or 0) + 1

        # Update discarded card counts
        if !factionStatsData.cardsDiscardedCounts
          factionStatsData.cardsDiscardedCounts = {}

        # Update total turns played (this represents turns played by opponents as well)
        totalTurns = 1 # for currentTurn
        if gameData.turns
          totalTurns += gameData.turns.length
        factionStatsData.totalTurnsPlayed = (factionStatsData.totalTurnsPlayed or 0) + totalTurns

        # Update play total stats
        factionStatsData.totalDamageDealt = (factionStatsData.totalDamageDealt or 0) + playerData.totalDamageDealt
        factionStatsData.totalDamageDealtToGeneral = (factionStatsData.totalDamageDealtToGeneral or 0) + playerData.totalDamageDealtToGeneral
        factionStatsData.totalMinionsKilled = (factionStatsData.totalMinionsKilled or 0) + playerData.totalMinionsKilled
        factionStatsData.totalMinionsPlayedFromHand = (factionStatsData.totalMinionsPlayedFromHand or 0) + playerData.totalMinionsPlayedFromHand
        factionStatsData.totalMinionsSpawned = (factionStatsData.totalMinionsSpawned or 0) + playerData.totalMinionsSpawned
        factionStatsData.totalSpellsCast = (factionStatsData.totalSpellsCast or 0) + playerData.totalSpellsCast
        factionStatsData.totalSpellsPlayedFromHand = (factionStatsData.totalSpellsPlayedFromHand or 0) + playerData.totalSpellsPlayedFromHand
      catch e
        Logger.module("UsersModule").debug "updateUserStatsWithGame() -> caught ERROR processing stats data for user #{userId}: #{e.message}".red
        throw new Error("ERROR PROCESSING STATS DATA")


      # Perform firebase transaction to update stats
      return new Promise (resolve, reject) ->
        Logger.module("UsersModule").debug "updateUserStatsWithGame() -> UPDATING stats for user #{userId}"

        # function to update quest list
        onUpdateUserStatsTransaction = (userStatsTransactionData)->
          # Don't care what the previous stats were, replace them with the updated version
          userStatsTransactionData = statsData
          userStatsTransactionData.updated_at = MOMENT_NOW_UTC.valueOf()

          return userStatsTransactionData

        # function to call when the quest update is complete
        onUpdateUserStatsTransactionComplete = (error,committed,snapshot) ->
          if error
            return reject(error)
          else if committed
            Logger.module("UsersModule").debug "updateUserStatsWithGame() -> updated user-stats committed for #{userId.blue}"
            return resolve(snapshot.val())
          else
            return reject(new Errors.FirebaseTransactionDidNotCommitError("User Stats for #{userId.blue} did NOT COMMIT"))

        # update users stats
        statsRef.transaction(onUpdateUserStatsTransaction,onUpdateUserStatsTransactionComplete)

  ###*
  # Completes a challenge for a user and unlocks any rewards !if! it's not already completed
  # @public
  # @param  {String}  userId          User ID.
  # @param  {String}  challenge_type      type of challenge completed
  # @param  {Boolean}  shouldProcessQuests    should we attempt to process quests as a result of this challenge completion (since beginner quests include a challenge quest)
  # @return  {Promise}  Promise that will resolve and give rewards if challenge hasn't been completed before, will resolve false and not give rewards if it has
  ###
  @completeChallengeWithType: (userId,challengeType,shouldProcessQuests) ->
    # TODO: Error check, if the challenge type isn't recognized we shouldn't record it etc

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    Logger.module("UsersModule").time "completeChallengeWithType() -> user #{userId.blue} completed challenge type #{challengeType}."

    knex("user_challenges").where({'user_id':userId,'challenge_id':challengeType}).first()
    .bind this_obj
    .then (challengeRow)->

      if challengeRow and challengeRow.completed_at
        Logger.module("UsersModule").debug "completeChallengeWithType() -> user #{userId.blue} has already completed challenge type #{challengeType}."
        return Promise.resolve(false)
      else
        txPromise = knex.transaction (tx)->
          # lock user record while updating data
          knex("users").where({'id':userId}).first('id').forUpdate().transacting(tx)
          .bind this_obj
          .then ()->
            # give the user their rewards
            goldReward = SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType)
            cardRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challengeType)
            spiritReward = SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType)
            boosterPackRewards = SDK.ChallengeFactory.getBoosterPacksRewardedForChallengeType(challengeType)
            factionUnlockedReward = SDK.ChallengeFactory.getFactionUnlockedRewardedForChallengeType(challengeType)

            @.rewards = []
            @.challengeRow =
              user_id:userId
              challenge_id:challengeType
              completed_at:MOMENT_NOW_UTC.toDate()
              last_attempted_at: challengeRow?.last_attempted_at || MOMENT_NOW_UTC.toDate()
              reward_ids:[]
              is_unread:true

            rewardPromises = []

            if goldReward

              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"challenge"
                reward_type:challengeType
                gold:goldReward
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              # add it to the rewards array
              @.rewards.push(rewardData)

              # add the promise to our list of reward promises
              rewardPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))
              rewardPromises.push(InventoryModule.giveUserGold(txPromise,tx,userId,goldReward,'challenge',challengeType))

            if cardRewards

              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"challenge"
                reward_type:challengeType
                cards:cardRewards
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              # add it to the rewards array
              @.rewards.push(rewardData)

              # add the promise to our list of reward promises
              rewardPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))
              rewardPromises.push(InventoryModule.giveUserCards(txPromise,tx,userId,cardRewards,'challenge'))

            if spiritReward

              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"challenge"
                reward_type:challengeType
                spirit:spiritReward
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              # add it to the rewards array
              @.rewards.push(rewardData)

              # add the promise to our list of reward promises
              rewardPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))
              rewardPromises.push(InventoryModule.giveUserSpirit(txPromise,tx,userId,spiritReward,'challenge'))

            if boosterPackRewards

              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"challenge"
                reward_type:challengeType
                spirit_orbs:boosterPackRewards.length
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              # add it to the rewards array
              @.rewards.push(rewardData)

              # add the promise to our list of reward promises
              rewardPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))

              _.each boosterPackRewards, (boosterPackData) ->
                # Bound to array of reward promises
                rewardPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,1,"soft",boosterPackData))

            if factionUnlockedReward

              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"challenge"
                reward_type:challengeType
                unlocked_faction_id:factionUnlockedReward
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              # add it to the rewards array
              @.rewards.push(rewardData)

              # add the promise to our list of reward promises
              rewardPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))

            @.challengeRow.reward_ids = _.map(@.rewards, (r)-> return r.id)

            if challengeRow
              rewardPromises.push knex("user_challenges").where({'user_id':userId,'challenge_id':challengeType}).update(@.challengeRow).transacting(tx)
            else
              rewardPromises.push knex("user_challenges").insert(@.challengeRow).transacting(tx)

            Promise.all(rewardPromises)
          .then ()->
            if @.challengeRow and shouldProcessQuests
              return QuestsModule.updateQuestProgressWithCompletedChallenge(txPromise,tx,userId,challengeType,MOMENT_NOW_UTC)
            else
              return Promise.resolve()
          .then (questProgressResponse)->

            if @.challengeRow and questProgressResponse?.rewards?.length > 0

              Logger.module("UsersModule").debug "completeChallengeWithType() -> user #{userId.blue} completed challenge quest rewards count: #{ questProgressResponse?.rewards.length}"

              for reward in questProgressResponse.rewards
                @.rewards.push(reward)
                @.challengeRow.reward_ids.push(reward.id)

              return knex("user_challenges").where({'user_id':userId,'challenge_id':challengeType}).update(
                reward_ids:@.challengeRow.reward_ids
              ).transacting(tx)

          .then ()->

            return Promise.all([
              DuelystFirebase.connect().getRootRef(),
              @.challengeRow,
              @.rewards
            ])

          .spread (rootRef,challengeRow,rewards)->

            allPromises = []

            if challengeRow?
              delete challengeRow.user_id
              # delete challengeRow.challenge_id

              if challengeRow.last_attempted_at then challengeRow.last_attempted_at = moment.utc(challengeRow.last_attempted_at).valueOf()
              if challengeRow.completed_at then challengeRow.completed_at = moment.utc(challengeRow.completed_at).valueOf()

              allPromises.push FirebasePromises.set(rootRef.child("user-challenge-progression").child(userId).child(challengeType),challengeRow)

              @.challengeRow = challengeRow

            # if rewards?
            #   for reward in rewards
            #     reward_id = reward.id
            #     delete reward.id
            #     delete reward.user_id
            #     reward.created_at = moment.utc(reward.created_at).valueOf()

            #     allPromises.push FirebasePromises.set(rootRef.child("user-rewards").child(userId).child(reward_id),reward)

            return Promise.all(allPromises)

          .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
          .then tx.commit
          .catch tx.rollback
          return

        .bind this_obj

        return txPromise

    .then ()->

      Logger.module("UsersModule").timeEnd "completeChallengeWithType() -> user #{userId.blue} completed challenge type #{challengeType}."

      responseData = null

      if @.challengeRow
        responseData = { challenge: @.challengeRow }

      if @.rewards
        responseData.rewards = @.rewards

      return responseData

  ###*
  # Marks a challenge as attempted.
  # @public
  # @param  {String}  userId        User ID.
  # @param  {String}  challenge_type    type of challenge
  # @return  {Promise}            Promise that will resolve on completion
  ###
  @markChallengeAsAttempted: (userId,challengeType) ->
    # TODO: Error check, if the challenge type isn't recognized we shouldn't record it etc

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    Logger.module("UsersModule").time "markChallengeAsAttempted() -> user #{userId.blue} attempted challenge type #{challengeType}."

    txPromise = knex.transaction (tx)->

      # lock user and challenge row
      Promise.all([
        knex("user_challenges").where({'user_id':userId,'challenge_id':challengeType}).first().forUpdate().transacting(tx)
        knex("users").where({'id':userId}).first('id').forUpdate().transacting(tx)
      ])
      .bind this_obj
      .spread (challengeRow)->

        @.challengeRow = challengeRow

        if @.challengeRow?
          @.challengeRow.last_attempted_at = MOMENT_NOW_UTC.toDate()
          return knex("user_challenges").where({'user_id':userId,'challenge_id':challengeType}).update(@.challengeRow).transacting(tx)
        else
          @.challengeRow =
            user_id:userId
            challenge_id:challengeType
            last_attempted_at:MOMENT_NOW_UTC.toDate()
          return knex("user_challenges").insert(@.challengeRow).transacting(tx)

      .then ()-> DuelystFirebase.connect().getRootRef()
      .then (rootRef)->

        allPromises = []

        if @.challengeRow?

          delete @.challengeRow.user_id
          # delete @.challengeRow.challenge_id

          if @.challengeRow.last_attempted_at then @.challengeRow.last_attempted_at = moment.utc(@.challengeRow.last_attempted_at).valueOf()
          if @.challengeRow.completed_at then @.challengeRow.completed_at = moment.utc(@.challengeRow.completed_at).valueOf()

          allPromises.push FirebasePromises.set(rootRef.child("user-challenge-progression").child(userId).child(challengeType),@.challengeRow)

        return Promise.all(allPromises)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      responseData = { challenge: @.challengeRow }
      return responseData

    return txPromise

  ###*
  # Iterate core new player progression up by one point if all requirements met, or generate missing quests if any required quests are missing from current/complete quest list for this user.
  # @public
  # @param  {String}  userId            User ID.
  # @return  {Promise}  Promise that will resolve when complete with the module progression data
  ###
  @iterateNewPlayerCoreProgression: (userId) ->

    knex("user_new_player_progression").where('user_id',userId).andWhere('module_name',NewPlayerProgressionModuleLookup.Core).first()
    .bind {}
    .then (moduleProgression)->

      stage = NewPlayerProgressionStageEnum[moduleProgression?.stage] || NewPlayerProgressionStageEnum.Tutorial

      # if we're at the final stage, just return
      if stage.value >= NewPlayerProgressionHelper.FinalStage.value
        return Promise.resolve()

      Promise.all([
        knex("user_quests").where('user_id',userId).select()
        knex("user_quests_complete").where('user_id',userId).select()
      ])
      .bind @
      .spread (quests,questsComplete)->

        beginnerQuests = NewPlayerProgressionHelper.questsForStage(stage)
        # exclude non-required beginner quests for this tage
        beginnerQuests = _.filter beginnerQuests, (q)-> return q.isRequired

        # if we have active quests, check that none are beginner for current stage
        if quests?.length > 0
          # let's see if any beginner quests for this stage are still in progress
          beginnerQuestInProgress = _.find(quests,(q)->
            return _.find(beginnerQuests,(bq)-> bq.id == q.quest_type_id)
          )
          # if any beginner quests for this stage are still in progress, DO NOTHING
          if beginnerQuestInProgress
            return Promise.resolve()

        # let's see if all beginner quests for this stage are completed
        beginnerQuestsComplete = _.filter(questsComplete,(q)->
          return _.find(beginnerQuests,(bq)-> bq.id == q.quest_type_id)
        )
        # if any beginner quests for this stage have NOT been completed, we have a problem... looks like we need to generate these quests
        if beginnerQuestsComplete?.length < beginnerQuests.length
          # throw new Error("Invalid state: user never received all required stage quests")
          Logger.module('SDK').warn "iterateNewPlayerCoreProgression() -> Invalid state: user #{userId.blue} never received all required stage #{stage.key} quests"
          return QuestsModule.generateBeginnerQuests(userId)
          .bind {}
          .then (questData)->
            if questData
              @.questData = questData
          .catch Errors.NoNeedForNewBeginnerQuestsError, (e)->
            Logger.module('SDK').debug "iterateNewPlayerCoreProgression() -> no need for new quests at #{nextStage.key} for #{userId.blue}"
          .then ()->
            @.progressionData = moduleProgression
            return @

        # if we're here, it means all required beginner quests have been completed up to here...
        # so let's push the core stage forward

        # calculate the next linear stage point for core progression
        nextStage = null
        for s in NewPlayerProgressionStageEnum.enums
          if s.value > stage.value
            Logger.module('SDK').debug "iterateNewPlayerCoreProgression() -> from stage #{stage.key} to next stage #{s.key} for #{userId.blue}"
            nextStage = s
            break

        # update current stage and generate any new beginner quests
        return UsersModule.setNewPlayerFeatureProgression(userId,NewPlayerProgressionModuleLookup.Core,nextStage.key)
        .bind {}
        .then (progressionData) ->
          @.progressionData = progressionData
          return QuestsModule.generateBeginnerQuests(userId)
        .then (questData)->
          if questData
            @.questData = questData
        .catch Errors.NoNeedForNewBeginnerQuestsError, (e)->
          Logger.module('SDK').debug "iterateNewPlayerCoreProgression() -> no need for new quests at #{nextStage.key} for #{userId.blue}"
        .then ()->
          return @

      .then (responseData)->
        return responseData

  ###*
  # Sets user feature progression for a module
  # @public
  # @param  {String}  userId            User ID.
  # @param  {String}  moduleName          Arbitrary name of a module
  # @param  {String}  stage            Arbitrary key for a progression item
  # @return  {Promise}  Promise that will resolve when complete with the module progression data
  ###
  @setNewPlayerFeatureProgression: (userId,moduleName,stage) ->
    # TODO: Error check, if the challenge type isn't recognized we shouldn't record it etc

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    Logger.module("UsersModule").time "setNewPlayerFeatureProgression() -> user #{userId.blue} marking module #{moduleName} as #{stage}."

    if moduleName == NewPlayerProgressionModuleLookup.Core and not NewPlayerProgressionStageEnum[stage]?
      return Promise.reject(new Errors.BadRequestError("Invalid core new player stage"))

    txPromise = knex.transaction (tx)->

      tx("user_new_player_progression").where({'user_id':userId,'module_name':moduleName}).first().forUpdate()
      .bind this_obj
      .then (progressionRow)->

        # core stage has some special rules
        if moduleName == NewPlayerProgressionModuleLookup.Core
          currentStage = progressionRow?.stage || NewPlayerProgressionStageEnum.Tutorial
          if NewPlayerProgressionStageEnum[stage].value < currentStage.value
            throw new Errors.BadRequestError("Can not roll back to a previous core new player stage")



        @.progressionRow = progressionRow
        queryPromise = null
        if progressionRow and progressionRow.stage == stage
          Logger.module("UsersModule").error "setNewPlayerFeatureProgression() -> ERROR: requested same stage: #{stage}."
          throw new Errors.BadRequestError("New player progression stage already at the requested stage")
        else if progressionRow
          # TODO: this never gets called, here 2 gets called twice for tutorial -> tutorialdone
          @.progressionRow.stage = stage
          @.progressionRow.updated_at = MOMENT_NOW_UTC.toDate()
          queryPromise = tx("user_new_player_progression").where({'user_id':userId,'module_name':moduleName}).update({
            stage: @.progressionRow.stage,
            updated_at: @.progressionRow.updated_at
          })
        else
          @.progressionRow =
            user_id:userId
            module_name:moduleName
            stage:stage
          queryPromise = tx("user_new_player_progression").insert(@.progressionRow)


        return queryPromise

      .then (updateCount)->
        if updateCount
          SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("UsersModule").timeEnd "setNewPlayerFeatureProgression() -> user #{userId.blue} marking module #{moduleName} as #{stage}."

      return @.progressionRow

    return txPromise

  ###*
  # Set a new portrait for a user
  # @public
  # @param  {String}  userId            User ID.
  # @param  {String}  portraitId          Portrait ID
  # @return  {Promise}  Promise that will resolve when complete with the module progression data
  ###
  @setPortraitId: (userId,portraitId) ->

    # userId must be defined
    if !userId?
      return Promise.reject(new Errors.NotFoundError("Can not setPortraitId(): invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    Logger.module("UsersModule").time "setPortraitId() -> user #{userId.blue}."

    txPromise = knex.transaction (tx)->
      InventoryModule.isAllowedToUseCosmetic(txPromise, tx, userId, portraitId)
      .bind this_obj
      .then ()->
        return knex("users").where({'id':userId}).update(
          portrait_id:portraitId
        )
      .then (updateCount)->
        if updateCount == 0
          throw new Errors.NotFoundError("User with id #{userId} not found")
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        return FirebasePromises.set(rootRef.child('users').child(userId).child('presence').child('portrait_id'),portraitId)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->
      Logger.module("UsersModule").timeEnd "setPortraitId() -> user #{userId.blue}."
      return portraitId

  ###*
  # Set a the preferred Battle Map for a user
  # @public
  # @param  {String}  userId            User ID.
  # @param  {String}  battleMapId          Battle Map ID
  # @return  {Promise}  Promise that will resolve when complete
  ###
  @setBattleMapId: (userId,battleMapId) ->

    # userId must be defined
    if !userId?
      return Promise.reject(new Errors.NotFoundError("Can not setPortraitId(): invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    Logger.module("UsersModule").time "setBattleMapId() -> user #{userId.blue}."



    txPromise = knex.transaction (tx)->
      checkForInventoryPromise = if battleMapId != null then InventoryModule.isAllowedToUseCosmetic(txPromise, tx, userId, battleMapId) else Promise.resolve(true)

      checkForInventoryPromise
      .bind this_obj
      .then ()->
        return tx("users").where({'id':userId}).update(
          battle_map_id:battleMapId
        )
      .then (updateCount)->
        if updateCount == 0
          throw new Errors.NotFoundError("User with id #{userId} not found")
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        return FirebasePromises.set(rootRef.child('users').child(userId).child('battle_map_id'),battleMapId)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->
      Logger.module("UsersModule").timeEnd "setBattleMapId() -> user #{userId.blue}."
      return battleMapId

  ###*
  # Add a small in-game notification for a user
  # @public
  # @param  {String}  userId      User ID.
  # @param  {String}  message      What message to show
  # @param  {String}  type      Message type
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @inGameNotify: (userId,message,type=null) ->
    # TODO: Error check, if the challenge type isn't recognized we shouldn't record it etc

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    return Promise.resolve()
    .bind {}
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (rootRef)->
      return FirebasePromises.push(rootRef.child("user-notifications").child(userId),{message:message,created_at:moment().utc().valueOf(),type:type})

  @___hardWipeUserData: (userId)->

    Logger.module("UsersModule").time "___hardWipeUserData() -> WARNING: hard wiping #{userId.blue}".red

    return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef)->
      return Promise.all([
        FirebasePromises.remove(fbRootRef.child('user-aggregates').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-arena-run').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-challenge-progression').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-decks').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-faction-progression').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-games').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-games').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-game-job-status').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-logs').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-matchmaking-errors').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-news').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-progression').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-quests').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-ranking').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-rewards').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-stats').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-transactions').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-achievements').child(userId)),

        knex("user_cards").where('user_id',userId).delete(),
        knex("user_card_collection").where('user_id',userId).delete(),
        knex("user_card_log").where('user_id',userId).delete(),
        knex("user_challenges").where('user_id',userId).delete(),
        knex("user_charges").where('user_id',userId).delete(),
        knex("user_currency_log").where('user_id',userId).delete(),
        knex("user_decks").where('user_id',userId).delete(),
        knex("user_faction_progression").where('user_id',userId).delete(),
        knex("user_faction_progression_events").where('user_id',userId).delete(),
        knex("user_games").where('user_id',userId).delete(),
        knex("user_gauntlet_run").where('user_id',userId).delete(),
        knex("user_gauntlet_run_complete").where('user_id',userId).delete(),
        knex("user_gauntlet_tickets").where('user_id',userId).delete(),
        knex("user_gauntlet_tickets_used").where('user_id',userId).delete(),
        knex("user_progression").where('user_id',userId).delete(),
        knex("user_progression_days").where('user_id',userId).delete(),
        knex("user_quests").where('user_id',userId).delete(),
        knex("user_quests_complete").where('user_id',userId).delete(),
        knex("user_rank_events").where('user_id',userId).delete(),
        knex("user_rank_history").where('user_id',userId).delete(),
        knex("user_rewards").where('user_id',userId).delete(),
        knex("user_spirit_orbs").where('user_id',userId).delete(),
        knex("user_spirit_orbs_opened").where('user_id',userId).delete(),
        knex("user_codex_inventory").where('user_id',userId).delete(),
        knex("user_new_player_progression").where('user_id',userId).delete(),
        knex("user_achievements").where('user_id',userId).delete(),
        knex("users").where('id',userId).update({
          ltv:0,
          rank:30,
          rank_created_at:null,
          rank_starting_at:null,
          rank_stars:0,
          rank_stars_required:1,
          rank_updated_at:null,
          rank_win_streak:0,
          rank_top_rank:null,
          rank_is_unread:false,
          top_rank:null,
          top_rank_starting_at:null,
          top_rank_updated_at:null,
          wallet_gold:0,
          wallet_spirit:0,
          wallet_cores:0,
          wallet_updated_at:null,
          total_gold_earned:0,
          total_spirit_earned:0,
          daily_quests_generated_at:null,
          daily_quests_updated_at:null
        })
      ])

    .then ()->

      Logger.module("UsersModule").timeEnd "___hardWipeUserData() -> WARNING: hard wiping #{userId.blue}".red

  ###*
  # Sets user feature progression for a module
  # @public
  # @param  {String}  userId            User ID.
  # @return  {Promise}  Promise that will resolve when complete
  ###
  @___snapshotUserData: (userId)->

    Logger.module("UsersModule").time "___snapshotUserData() -> retrieving data for user ID #{userId.blue}".green

    # List of the columns we want to grab from the users table, is everything except password
    userTableColumns = ["id","created_at","updated_at","last_session_at","session_count","username_updated_at",
                        "password_updated_at","invite_code","ltv","purchase_count","last_purchase_at","rank",
                        "rank_created_at","rank_starting_at","rank_stars","rank_stars_required","rank_delta","rank_top_rank",
                        "rank_updated_at","rank_win_streak","rank_is_unread","top_rank","top_rank_starting_at","top_rank_updated_at",
                        "daily_quests_generated_at","daily_quests_updated_at","achievements_last_read_at","wallet_gold",
                        "wallet_spirit","wallet_cores","wallet_updated_at","total_gold_earned","total_spirit_earned","buddy_count",
                        "tx_count","synced_firebase_at","stripe_customer_id","card_last_four_digits","card_updated_at",
                        "top_gauntlet_win_count","portrait_id","total_gold_tips_given","referral_code","is_suspended","suspended_at",
                        "suspended_memo","top_rank_ladder_position","top_rank_rating","is_bot"]

    return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef)->
      return Promise.all([
        FirebasePromises.once(fbRootRef.child('user-aggregates').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-arena-run').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-challenge-progression').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-decks').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-faction-progression').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-games').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-game-job-status').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-inventory').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-logs').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-matchmaking-errors').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-news').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-progression').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-quests').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-ranking').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-rewards').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-stats').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-transactions').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-achievements').child(userId),"value"),

        knex("user_cards").where('user_id',userId).select(),
        knex("user_card_collection").where('user_id',userId).select(),
        knex("user_card_log").where('user_id',userId).select(),
        knex("user_challenges").where('user_id',userId).select(),
        knex("user_charges").where('user_id',userId).select(),
        knex("user_currency_log").where('user_id',userId).select(),
        knex("user_decks").where('user_id',userId).select(),
        knex("user_faction_progression").where('user_id',userId).select(),
        knex("user_faction_progression_events").where('user_id',userId).select(),
        knex("user_games").where('user_id',userId).select(),
        knex("user_gauntlet_run").where('user_id',userId).select(),
        knex("user_gauntlet_run_complete").where('user_id',userId).select(),
        knex("user_gauntlet_tickets").where('user_id',userId).select(),
        knex("user_gauntlet_tickets_used").where('user_id',userId).select(),
        knex("user_progression").where('user_id',userId).select(),
        knex("user_progression_days").where('user_id',userId).select(),
        knex("user_quests").where('user_id',userId).select(),
        knex("user_quests_complete").where('user_id',userId).select(),
        knex("user_rank_events").where('user_id',userId).select(),
        knex("user_rank_history").where('user_id',userId).select(),
        knex("user_rewards").where('user_id',userId).select(),
        knex("user_spirit_orbs").where('user_id',userId).select(),
        knex("user_spirit_orbs_opened").where('user_id',userId).select(),
        knex("user_codex_inventory").where('user_id',userId).select(),
        knex("user_new_player_progression").where('user_id',userId).select(),
        knex("user_achievements").where('user_id',userId).select(),
        knex("user_cosmetic_chests").where('user_id',userId).select(),
        knex("user_cosmetic_chests_opened").where('user_id',userId).select(),
        knex("user_cosmetic_chest_keys").where('user_id',userId).select(),
        knex("user_cosmetic_chest_keys_used").where('user_id',userId).select(),
        knex("users").where('id',userId).first(userTableColumns)
      ])

    .spread (fbUserAggregates,fbUserArenaRun,fbUserChallengeProgression,fbUserDecks,fbUserFactionProgression,fbUserGames,fbUserGameJobStatus,fbUserInventory,fbUserLogs,
      fbUserMatchmakingErrors,fbUserNews,fbUserProgression,fbUserQuests,fbUserRanking,fbUserRewards,fbUserStats,fbUserTransactions,fbUserAchievements,
      sqlUserCards,sqlUserCardCollection,sqlUserCardLog,sqlUserChallenges,sqlUserCharges,sqlUserCurrencyLog,sqlUserDecks,sqlUserFactionProgression,sqlUserFactionProgressionEvents,
      sqlUserGames,sqlUserGauntletRun,sqlUserGauntletRunComplete,sqlUserGauntletTickets,sqlUserGauntletTicketsUsed,sqlUserProgression,
      sqlUserProgressionDays,sqlUserQuests,sqlUserQuestsComplete,sqlUserRankEvents,sqlUserRankHistory,sqlUserRewards,sqlUserSpiritOrbs,sqlUserSpiritOrbsOpened,
      sqlUserCodexInventory,sqlUserNewPlayerProgression,sqlUserAchievements,sqlUserChestRows,sqlUserChestOpenedRows,sqlUserChestKeyRows,sqlUserChestKeyUsedRows,sqlUserRow
    ) ->
      userSnapshot = {
        firebase: {}
        sql: {}
      }

      userSnapshot.firebase.fbUserAggregates = fbUserAggregates?.val()
      userSnapshot.firebase.fbUserArenaRun = fbUserArenaRun?.val()
      userSnapshot.firebase.fbUserChallengeProgression = fbUserChallengeProgression?.val()
      userSnapshot.firebase.fbUserDecks = fbUserDecks?.val()
      userSnapshot.firebase.fbUserFactionProgression = fbUserFactionProgression?.val()
      userSnapshot.firebase.fbUserGames = fbUserGames?.val()
      userSnapshot.firebase.fbUserGameJobStatus = fbUserGameJobStatus?.val()
      userSnapshot.firebase.fbUserInventory = fbUserInventory?.val()
      userSnapshot.firebase.fbUserLogs = fbUserLogs?.val()

      userSnapshot.firebase.fbUserMatchmakingErrors = fbUserMatchmakingErrors?.val()
      userSnapshot.firebase.fbUserNews = fbUserNews?.val()
      userSnapshot.firebase.fbUserProgression = fbUserProgression?.val()
      userSnapshot.firebase.fbUserQuests = fbUserQuests?.val()
      userSnapshot.firebase.fbUserRanking = fbUserRanking?.val()
      userSnapshot.firebase.fbUserRewards = fbUserRewards?.val()
      userSnapshot.firebase.fbUserStats = fbUserStats?.val()
      userSnapshot.firebase.fbUserTransactions = fbUserTransactions?.val()
      userSnapshot.firebase.fbUserAchievements = fbUserAchievements?.val()

      userSnapshot.sql.sqlUserCards = sqlUserCards
      userSnapshot.sql.sqlUserCardCollection = sqlUserCardCollection
      userSnapshot.sql.sqlUserCardLog = sqlUserCardLog
      userSnapshot.sql.sqlUserChallenges = sqlUserChallenges
      userSnapshot.sql.sqlUserCharges = sqlUserCharges
      userSnapshot.sql.sqlUserCurrencyLog = sqlUserCurrencyLog
      userSnapshot.sql.sqlUserFactionProgression = sqlUserFactionProgression
      userSnapshot.sql.sqlUserFactionProgressionEvents = sqlUserFactionProgressionEvents

      userSnapshot.sql.sqlUserGames = sqlUserGames
      userSnapshot.sql.sqlUserGauntletRun = sqlUserGauntletRun
      userSnapshot.sql.sqlUserGauntletRunComplete = sqlUserGauntletRunComplete
      userSnapshot.sql.sqlUserGauntletTickets = sqlUserGauntletTickets
      userSnapshot.sql.sqlUserGauntletTicketsUsed = sqlUserGauntletTicketsUsed
      userSnapshot.sql.sqlUserProgression = sqlUserProgression

      userSnapshot.sql.sqlUserProgressionDays = sqlUserProgressionDays
      userSnapshot.sql.sqlUserQuests = sqlUserQuests
      userSnapshot.sql.sqlUserQuestsComplete = sqlUserQuestsComplete
      userSnapshot.sql.sqlUserRankEvents = sqlUserRankEvents
      userSnapshot.sql.sqlUserRankHistory = sqlUserRankHistory
      userSnapshot.sql.sqlUserRewards = sqlUserRewards
      userSnapshot.sql.sqlUserSpiritOrbs = sqlUserSpiritOrbs
      userSnapshot.sql.sqlUserSpiritOrbsOpened = sqlUserSpiritOrbsOpened

      userSnapshot.sql.sqlUserCodexInventory = sqlUserCodexInventory
      userSnapshot.sql.sqlUserNewPlayerProgression = sqlUserNewPlayerProgression
      userSnapshot.sql.sqlUserAchievements = sqlUserAchievements
      userSnapshot.sql.sqlUserChestRows = sqlUserChestRows
      userSnapshot.sql.sqlUserChestOpenedRows = sqlUserChestOpenedRows
      userSnapshot.sql.sqlUserChestKeyRows = sqlUserChestKeyRows
      userSnapshot.sql.sqlUserChestKeyUsedRows = sqlUserChestKeyUsedRows



      userSnapshot.sql.sqlUserRow = sqlUserRow

      Logger.module("UsersModule").timeEnd "___snapshotUserData() -> retrieving data for user ID #{userId.blue}".green

      return userSnapshot

  ###*
  # Tip your opponent for a specific game
  # @public
  # @param  {String}  userId      User ID.
  # @param  {String}  gameId      Game ID to tip for
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @tipAnotherPlayerForGame: (userId,gameId,goldAmount=5)->

    MOMENT_NOW_UTC = moment().utc()

    Promise.all([
      knex("users").where('id',userId).first('username','wallet_gold')
      knex("user_games").where({user_id:userId,game_id:gameId}).first()
    ]).spread (userRow,gameRow)->

      # we need a game row
      if not gameRow?
        throw new Errors.NotFoundError("Player game not found")

      # game must be less than a day old
      timeSinceCreated = moment.duration(MOMENT_NOW_UTC.diff(moment.utc(gameRow.created_at)))
      if timeSinceCreated.asDays() > 1.0
        throw new Errors.BadRequestError("Game is too old")

      # only the winner can tip
      if not gameRow.is_winner
        throw new Errors.BadRequestError("Only the winner can tip")

      # we don't allow multiple tips
      if gameRow.gold_tip_amount?
        throw new Errors.AlreadyExistsError("Tip already given")

      # we don't allow multiple tips
      if userRow?.wallet_gold < goldAmount
        throw new Errors.InsufficientFundsError("Not enough GOLD to tip")

      # don't allow tips in friendly or sp games
      if gameRow.game_type == "friendly" || gameRow.game_type == "single_player"
        throw new Errors.BadRequestError("Can not tip in friendly or single player games")

      # grab the opponent id so we know who to tip
      playerId = gameRow.opponent_id

      txPromise = knex.transaction (tx)->

        Promise.all([
          # debit user's gold
          InventoryModule.debitGoldFromUser(txPromise,tx,userId,-goldAmount,"gold tip to #{gameId}:#{playerId}")
          # give opponent gold
          InventoryModule.giveUserGold(txPromise,tx,playerId,goldAmount,"gold tip from #{gameId}:#{userId}")
          # update user game record
          knex("user_games").where({user_id:userId,game_id:gameId}).update('gold_tip_amount',goldAmount).transacting(tx)
          # update master game record
          knex("games").where({id:gameId}).increment('gold_tip_amount',goldAmount).transacting(tx)
          # update master game record
          knex("users").where({id:userId}).increment('total_gold_tips_given',goldAmount).transacting(tx)
        ]).then ()->
          return Promise.all([
            SyncModule._bumpUserTransactionCounter(tx,userId)
            SyncModule._bumpUserTransactionCounter(tx,playerId)
          ])
        .then ()-> return UsersModule.inGameNotify(playerId,"#{userRow.username} tipped you #{goldAmount} GOLD","gold tip")
        .then tx.commit
        .catch tx.rollback

      return txPromise

  ###*
  # Suspend a user account
  # @public
  # @param  {String}  userId      User ID.
  # @param  {String}  reasonMemo    Why is this user suspended?
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @suspendUser: (userId,reasonMemo)->
    return knex("users").where('id',userId).update({
      is_suspended: true
      suspended_at: moment().utc().toDate()
      suspended_memo: reasonMemo
    })

  ###*
  # @public
  # @param  {String}  userId      User ID.
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @isEligibleForTwitchDrop: (userId, itemId = null)->
    return Promise.resolve(true)

  ###*
  # Export a user account data as is (for user requested account export)
  # @public
  # @param  {String}  userId      User ID.
  # @return  {Promise}          Promise that will resolve when complete
  ###
  @exportUser: (userId)->
    return UsersModule.___snapshotUserData(userId)
    .then (userData) ->
      # we may want to filter out selective data at this point before exporting
      return userData
    .catch (e) ->
      Logger.module("UsersModule").error "exportUser() -> #{e.message}".red
      return null

module.exports = UsersModule
