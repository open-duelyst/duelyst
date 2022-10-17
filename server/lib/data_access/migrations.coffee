Promise = require 'bluebird'
util = require 'util'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
fbUtil = require '../../../app/common/utils/utils_firebase.js'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
uuid = require 'node-uuid'
moment = require 'moment'
_ = require 'underscore'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
DataAccessHelpers = require('./helpers')
InventoryModule = require './inventory'
semver = require 'semver'

# SDK imports
SDK = require '../../../app/sdk'
QuestFactory = require '../../../app/sdk/quests/questFactory'
QuestType = require '../../../app/sdk/quests/questTypeLookup'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
CosmeticsLookup = require '../../../app/sdk/cosmetics/cosmeticsLookup'


class MigrationsModule

  # region PER USER MIGRATIONS

  ###*
  # Checks if a user needs to have the emotes -> cosmetics migration
  # @private
  # @param  {Object}  userRow      the user's current db row (specifically needs last_session_at and created_at)
  # @return  {Promise}              Promise that will resolve to true or false
  ###
  @checkIfUserNeedsMigrateEmotes20160708: (userRow) ->
    migrationDeadlineMoment = moment.utc("2016-07-22 03:30")
    userLastSessionMoment = moment.utc(userRow.last_session_at)
    if (not userRow.last_session_at?)
      userLastSessionMoment = moment.utc(userRow.created_at)

    if not userLastSessionMoment.isBefore(migrationDeadlineMoment)
      return Promise.resolve(false)
    else
      return knex("user_cosmetic_inventory").first().where("user_id",userRow.id).andWhere("transaction_id","migration 20160708")
      .then (userCosmeticRow) ->
        # Presence of any cosmetic rows means they don't need a migration
        if userCosmeticRow?
          return Promise.resolve(false)
        else
          return Promise.resolve(true)

  ###*
  # Migrates a user's emotes from user_emotes table to user_cosmetic_inventory table
  # @private
  # @param  {String}  userId       userId to migration
  # @return  {Promise}              Promise that resolves on completion
  ###
  @userMigrateEmotes20160708: (userId, systemTime) ->

    unless userId
      Logger.module("MigrationsModule").debug "userMigrateEmotes20160708() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not migrate emotes for user: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()

    Logger.module("MigrationsModule").debug "userMigrateEmotes20160708() -> migrating emotes for user #{userId}".green

    Logger.module("MigrationsModule").time "userMigrateEmotes20160708() -> #{userId} done".green

    # Giving players all pre cosmetics emotes if they played before cosmetics patch
    emoteIdsToGive = [
      CosmeticsLookup.Emote.Faction1Taunt
      CosmeticsLookup.Emote.Faction1Angry
      CosmeticsLookup.Emote.Faction1Confused
      CosmeticsLookup.Emote.Faction1Sad
      CosmeticsLookup.Emote.Faction1Frustrated
      CosmeticsLookup.Emote.Faction1Surprised
      CosmeticsLookup.Emote.Faction1Bow
      CosmeticsLookup.Emote.Faction1Sleep
      CosmeticsLookup.Emote.Faction1Sunglasses
      CosmeticsLookup.Emote.Faction1Kiss
      # CosmeticsLookup.Emote.Faction1Happy
      CosmeticsLookup.Emote.Faction2Taunt
      CosmeticsLookup.Emote.Faction2Happy
      CosmeticsLookup.Emote.Faction2Confused
      CosmeticsLookup.Emote.Faction2Sad
      CosmeticsLookup.Emote.Faction2Frustrated
      CosmeticsLookup.Emote.Faction2Surprised
      CosmeticsLookup.Emote.Faction2Bow
      CosmeticsLookup.Emote.Faction2Sleep
      CosmeticsLookup.Emote.Faction2Sunglasses
      CosmeticsLookup.Emote.Faction2Kiss
      # CosmeticsLookup.Emote.Faction2Angry
      CosmeticsLookup.Emote.Faction3Taunt
      CosmeticsLookup.Emote.Faction3Happy
      CosmeticsLookup.Emote.Faction3Angry
      CosmeticsLookup.Emote.Faction3Sad
      CosmeticsLookup.Emote.Faction3Frustrated
      CosmeticsLookup.Emote.Faction3Surprised
      CosmeticsLookup.Emote.Faction3Bow
      CosmeticsLookup.Emote.Faction3Sleep
      CosmeticsLookup.Emote.Faction3Sunglasses
      CosmeticsLookup.Emote.Faction3Kiss
      # CosmeticsLookup.Emote.Faction3Confused
      CosmeticsLookup.Emote.Faction4Taunt
      CosmeticsLookup.Emote.Faction4Happy
      CosmeticsLookup.Emote.Faction4Angry
      CosmeticsLookup.Emote.Faction4Confused
      CosmeticsLookup.Emote.Faction4Sad
      CosmeticsLookup.Emote.Faction4Surprised
      CosmeticsLookup.Emote.Faction4Bow
      CosmeticsLookup.Emote.Faction4Sleep
      CosmeticsLookup.Emote.Faction4Sunglasses
      CosmeticsLookup.Emote.Faction4Kiss
      # CosmeticsLookup.Emote.Faction4Frustrated
      CosmeticsLookup.Emote.Faction5Taunt
      CosmeticsLookup.Emote.Faction5Happy
      CosmeticsLookup.Emote.Faction5Angry
      CosmeticsLookup.Emote.Faction5Confused
      CosmeticsLookup.Emote.Faction5Frustrated
      CosmeticsLookup.Emote.Faction5Surprised
      CosmeticsLookup.Emote.Faction5Bow
      CosmeticsLookup.Emote.Faction5Sleep
      CosmeticsLookup.Emote.Faction5Sunglasses
      CosmeticsLookup.Emote.Faction5Kiss
      # CosmeticsLookup.Emote.Faction5Sad
      CosmeticsLookup.Emote.Faction6Frustrated
      CosmeticsLookup.Emote.Faction6Happy
      CosmeticsLookup.Emote.Faction6Angry
      CosmeticsLookup.Emote.Faction6Confused
      CosmeticsLookup.Emote.Faction6Sad
      CosmeticsLookup.Emote.Faction6Surprised
      CosmeticsLookup.Emote.Faction6Bow
      CosmeticsLookup.Emote.Faction6Sleep
      CosmeticsLookup.Emote.Faction6Sunglasses
      CosmeticsLookup.Emote.Faction6Taunt
      # CosmeticsLookup.Emote.Faction6Kiss
    ]


    txPromise = knex.transaction (tx) ->
      tx("users").first("id").where("id",userId).forUpdate()
      .then () ->
        return Promise.map(emoteIdsToGive, (emoteId) ->
          transactionType = "migration gift"
          transactionId = "migration 20160708"

          return InventoryModule.giveUserCosmeticId(txPromise,tx,userId,emoteId,transactionType,transactionId,null,MOMENT_NOW_UTC)
        )
      .then () ->
        return tx("user_emotes").where("user_id",userId).select()
      .then (userEmoteRows) ->
        ownedUserEmotes = _.map(userEmoteRows, (userEmoteRow) -> return userEmoteRow.emote_id)
        # To be safe that no duplicates are given
        ownedUserEmotes = _.filter(ownedUserEmotes, (ownedUserEmoteId) ->
          return not _.contains(emoteIdsToGive,ownedUserEmoteId)
        )
        return Promise.map(ownedUserEmotes, (emoteId) ->
          transactionType = "migrated emote"
          transactionId = "migration 20160708"

          return InventoryModule.giveUserCosmeticId(txPromise,tx,userId,emoteId,transactionType,transactionId,null,MOMENT_NOW_UTC)
        )
      .then () ->
        return tx("user_emotes").where("user_id",userId).delete()
      .then () ->
        return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        return FirebasePromises.remove(fbRootRef.child("user-inventory").child(userId).child("emotes"))
      .then tx.commit
      .catch tx.rollback

      return
    .then () ->
      Logger.module("MigrationsModule").timeEnd "userMigrateEmotes20160708() -> #{userId} done".green
    return txPromise

  ###*
  # Checks if a user needs to be given prismatic rewards based on spirit orbs opened prior to prismatic feature
  # @private
  # @param  {Object}  userRow      the user's current db row (specifically needs last_session_version)
  # @return  {Promise}              Promise that will resolve to true or false (This doesn't require a promise but this is keeps convention)
  ###
  @checkIfUserNeedsPrismaticBackfillReward: (userRow) ->

    prismaticBackFillVersion = "1.73.0"

    userLastSessionVersion = userRow.last_session_version

    if not userLastSessionVersion?
      userLastSessionVersion = "0.0.0"

    if semver.gte(userLastSessionVersion,prismaticBackFillVersion)
      return Promise.resolve(false)
    else
      # Safety check to make sure no user will get rewards even if version check fails
      return knex("user_card_log").first("source_type").where("user_id",userRow.id).andWhere("source_type","prismatic backfill")
      .then (userCardLogRow) ->
        # Presence of any card log rows with 'prismatic backfill' means they don't need a migration
        if userCardLogRow?
          return Promise.resolve(false)
        else
          return Promise.resolve(true)

  ###*
  # Migrates a user's emotes from user_emotes table to user_cosmetic_inventory table
  # @private
  # @param  {String}  userId       userId to migration
  # @return  {Promise}              Promise that resolves on completion
  ###
  @userBackfillPrismaticRewards: (userId, systemTime) ->

    unless userId
      Logger.module("MigrationsModule").debug "userBackfillPrismaticRewards() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not backfill prismatic for user: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()

    # Transaction identifiers to user for giving prismatics
    sourceType = "prismatic backfill"
    sourceId = "migration 20160815"

    # Prismatics were added around Thursday, 21 July 2016 at 6:00:00 PM UTC
    prismaticFeatureAddedMoment = moment.utc("2016-07-21 20:00") # 2 Hours extra time just in case

    Logger.module("MigrationsModule").debug "userBackfillPrismaticRewards() -> backfilling prismatics for user #{userId}".green

    Logger.module("MigrationsModule").time "userBackfillPrismaticRewards() -> #{userId} done".green

    txPromise = knex.transaction (tx) ->
      tx("users").first("id").where("id",userId).forUpdate()
      .then () ->
        return tx("user_spirit_orbs_opened").count().where("user_id",userId).andWhere('opened_at','<',prismaticFeatureAddedMoment.toDate())
      .then (countData) ->
        numSpiritOrbsOpened = parseInt(countData[0].count)

        Logger.module("MigrationsModule").debug "userBackfillPrismaticRewards() -> user #{userId} opened #{numSpiritOrbsOpened} before prismatics".green

        cardsRewarded = []

        if numSpiritOrbsOpened < 20
          # Do nothing, there is no reward for less than 20
        else if numSpiritOrbsOpened < 50
          commonCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Common).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          rareCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Rare).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          epicCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Epic).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          # 2 common prismatics
          cardsRewarded.push(_.sample(commonCards))
          cardsRewarded.push(_.sample(commonCards))
          # 2 rare prismatics
          cardsRewarded.push(_.sample(rareCards))
          cardsRewarded.push(_.sample(rareCards))
          # 2 epic prismatics
          cardsRewarded.push(_.sample(epicCards))
          cardsRewarded.push(_.sample(epicCards))
        else
          numRewardBlocks = Math.floor(numSpiritOrbsOpened / 50)
          commonCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Common).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          rareCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Rare).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          epicCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Epic).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          legendaryCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
          for i in [1..numRewardBlocks]
            # 4 common prismatics
            cardsRewarded.push(_.sample(commonCards))
            cardsRewarded.push(_.sample(commonCards))
            cardsRewarded.push(_.sample(commonCards))
            cardsRewarded.push(_.sample(commonCards))
            # 3 rare prismatics
            cardsRewarded.push(_.sample(rareCards))
            cardsRewarded.push(_.sample(rareCards))
            cardsRewarded.push(_.sample(rareCards))
            # 2 epic prismatics
            cardsRewarded.push(_.sample(epicCards))
            cardsRewarded.push(_.sample(epicCards))
            # 1 legendary prismatic
            cardsRewarded.push(_.sample(legendaryCards))

        prismaticCardIdsRewarded =   _.map(cardsRewarded, (cardRewarded) ->
          baseCardId = cardRewarded.getBaseCardId()
          prismaticCardId = SDK.Cards.getPrismaticCardId(baseCardId)
          return prismaticCardId
        )

        Logger.module("MigrationsModule").debug "userBackfillPrismaticRewards() -> user #{userId} received #{prismaticCardIdsRewarded.length} cards in prismatic backfill".green

        return InventoryModule.giveUserCards(txPromise,tx,userId,prismaticCardIdsRewarded,sourceType,sourceId)

      .then tx.commit
      .catch tx.rollback

      return
    .then () ->
      Logger.module("MigrationsModule").timeEnd "userBackfillPrismaticRewards() -> #{userId} done".green
    return txPromise

  ###*
  # Checks if a user needs to be create purchase counter records in DB for products with purchase_limit
  # @private
  # @param  {Object}  userRow      the user's current db row (specifically needs last_session_version)
  # @return  {Promise}          Promise that will resolve to true or false (This doesn't require a promise but this is keeps convention)
  ###
  @checkIfUserNeedsChargeCountsMigration: (userRow) ->

    versionFeatureIntroduced = "1.74.11"
    userLastSessionVersion = userRow.last_session_version || "0.0.0"

    if semver.gte(userLastSessionVersion,versionFeatureIntroduced)
      return Promise.resolve(false)
    else
      return knex("users").first("purchase_count").where("id",userRow.id)
      .then (user) ->
        requiresMigration = user.purchase_count > 0
        return Promise.resolve(requiresMigration)

  ###*
  # ...
  # @private
  # @param  {String}  userId       userId to migration
  # @return  {Promise}          Promise that resolves on completion
  ###
  @userCreateChargeCountsMigration: (userId, systemTime) ->

    unless userId
      Logger.module("MigrationsModule").debug "userCreateChargeCountsMigration() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not backfill charge counts for user: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    Logger.module("MigrationsModule").time "userCreateChargeCountsMigration() -> #{userId} done".green

    txPromise = knex.transaction (tx) ->

      # NOTE: because we don't have sku data for old products, we can't migrate anything other than starter bundle purchase count

      # return tx("user_charges").where("user_id",userId)
      # .bind {}
      # .then (chargeRows) ->
      #   allPromises = []
      #   @.purchaseCounts = {}
      #   for row in chargeRows
      #     if not row.sku
      #       row.sku = row.charge_json[""]
      #       allPromises.push tx("user_charges").where('charge_id',row.charge_id).update({ sku:row.sku })
      #     @.purchaseCounts[row.sku] ?= {}
      #     @.purchaseCounts[row.sku].count ?= 0
      #     @.purchaseCounts[row.sku].count += 1
      #   return Promise.all(allPromises)
      # .then ()-> return DuelystFirebase.connect().getRootRef()
      # .then (rootRef) -> return FirebasePromises.set(rootRef.child("user-purchase-counts").child(userId), @.purchaseCounts)

      return Promise.all([
        tx("users").where("id",userId).first("has_purchased_starter_bundle"),
        DuelystFirebase.connect().getRootRef()
      ]).spread (userRow,rootRef) ->
        if userRow.has_purchased_starter_bundle
          return FirebasePromises.set(rootRef.child("user-purchase-counts").child(userId).child("STARTERBUNDLE_201604"), { count: 1 })

    .then () ->
      Logger.module("MigrationsModule").timeEnd "userCreateChargeCountsMigration() -> #{userId} done".green
    return txPromise


  ###*
  # Checks if a user has a incomplete gauntlet run made before the Gauntlet changes
  # @private
  # @param  {Object}  userRow      the user's current db row (specifically needs last_session_version)
  # @return  {Promise}          Promise that will resolve to true or false (This doesn't require a promise but this is keeps convention)
  ###
  @checkIfUserNeedsIncompleteGauntletRefund: (userRow) ->

    versionFeatureIntroduced = "1.85.0"
    userLastSessionVersion = userRow.last_session_version || "0.0.0"

    if semver.gte(userLastSessionVersion,versionFeatureIntroduced)
      return Promise.resolve(false)
    else
      return knex("user_gauntlet_run").first("is_complete","created_at","faction_choices").where("user_id",userRow.id)
      .then (currentRunRow) ->
        if not currentRunRow?
          return Promise.resolve(false)

        currentRunStartedMoment = moment.utc(currentRunRow.created_at)
        refundRunsStartBefore = moment.utc("2017-05-31 13:00")

        # Only refund incomplete runs
        if currentRunRow.is_complete
          return Promise.resolve(false)

        # Only refund runs started before new patch
        if currentRunStartedMoment.valueOf() >= refundRunsStartBefore.valueOf()
          return Promise.resolve(false)

        # Final check, only perform this if the row contains faction choices which are not present in new data
        if currentRunRow.faction_choices?
          return Promise.resolve(true)
        else
          return Promise.resolve(false)

  ###*
  # ...
  # @private
  # @param  {String}  userId       userId to migration
  # @return  {Promise}          Promise that resolves on completion
  ###
  @userIncompleteGauntletRefund: (userId, systemTime) ->

    unless userId
      Logger.module("MigrationsModule").debug "userIncompleteGauntletRefund() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not check for incomplete Gauntlet Run: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    Logger.module("MigrationsModule").time "userIncompleteGauntletRefund() -> #{userId} done".green

    txPromise = knex.transaction (tx) ->

      return tx("user_gauntlet_run").where("user_id",userId).delete()
      .then ()->
        return InventoryModule.addArenaTicketToUser(txPromise,tx,userId,"migration refund")
      .then ()->
        return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        return FirebasePromises.remove(fbRootRef.child("user-gauntlet-run").child(userId).child("current"))

    .then () ->
      Logger.module("MigrationsModule").timeEnd "userIncompleteGauntletRefund() -> #{userId} done".green
    return txPromise

  ###*
  # Checks if a user has unlockable orbs which have now been combined
  # @private
  # @param  {Object}  userRow      the user's current db row (specifically needs last_session_version)
  # @return  {Promise}          Promise that will resolve to true or false
  ###
  @checkIfUserNeedsUnlockableOrbsRefund: (userRow) ->
    versionFeatureIntroduced = "1.92.0"
    userLastSessionVersion = userRow.last_session_version || "0.0.0"

    if semver.gte(userLastSessionVersion,versionFeatureIntroduced)
      return Promise.resolve(false)
    else
      knex("user_spirit_orbs").first("user_id","card_set").whereIn("card_set",[SDK.CardSet.Bloodborn,SDK.CardSet.Unity]).andWhere("user_id",userRow.id)
      .then (unlockableOrbRow) ->
        if (unlockableOrbRow?)
          return Promise.resolve(true)
        else
          return Promise.resolve(false)

  ###*
  # Refunds a user 300 gold for any unopened unlockable orbs that have been combined into the combined orb set
  # @private
  # @param  {String}  userId       userId to migration
  # @return  {Promise}          Promise that resolves on completion
  ###
  @userUnlockableOrbsRefund: (userId, systemTime) ->
    unlockableOrbGoldRefundAmount = 300

    unless userId
      Logger.module("MigrationsModule").debug "userUnlockableOrbsRefund() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not check for incomplete Gauntlet Run: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()
    Logger.module("MigrationsModule").time "userUnlockableOrbsRefund() -> #{userId} done".green

    txPromise = knex.transaction (tx) ->

      tx("user_spirit_orbs").select("id","user_id","card_set").whereIn("card_set",[SDK.CardSet.Bloodborn,SDK.CardSet.Unity]).andWhere("user_id",userId)
      .bind {}
      .then (userUnlockableSpiritOrbRows)->
        @.userUnlockableSpiritOrbRows = userUnlockableSpiritOrbRows
        return Promise.map(@.userUnlockableSpiritOrbRows, (unlockableOrbRow) ->
          return Promise.all([
            tx("user_spirit_orbs").where('id',unlockableOrbRow.id).delete()
            InventoryModule.giveUserGold(txPromise,tx,userId,unlockableOrbGoldRefundAmount,"unlockable orb refund",unlockableOrbRow.id)
          ])
        )
      .then ()->
        return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        return Promise.map(@.userUnlockableSpiritOrbRows, (unlockableOrbRow) ->
          return FirebasePromises.remove(fbRootRef.child("user-inventory").child(userId).child("spirit-orbs").child(unlockableOrbRow.id))
        )
        return FirebasePromises.remove(fbRootRef.child("user-gauntlet-run").child(userId).child("current"))

    .then () ->
      Logger.module("MigrationsModule").timeEnd "userUnlockableOrbsRefund() -> #{userId} done".green


  # endregion PER USER MIGRATIONS




module.exports = MigrationsModule
