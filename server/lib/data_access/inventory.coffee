Promise = require 'bluebird'
util = require 'util'
colors = require 'colors'
moment = require 'moment'
_ = require 'underscore'

FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
Logger = require '../../../app/common/logger.coffee'
SyncModule = require './sync'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'

# redis
{Redis, Jobs, GameManager} = require '../../redis/'

# SDK imports
SDK = require '../../../app/sdk'

class InventoryModule
  ###*
  # Maximum number of soft wipes allowed. Determines if a user is eligible for a wipe.
  # @public
  ###
  @MAX_SOFTWIPE_COUNT: 1

  ###*
  # When's the cutoff time for the currently active soft wipe.
  # @public
  ###
  @SOFTWIPE_AVAILABLE_UNTIL: moment.utc("2016-04-20")

  ###*
  # Give a user gold.
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add gold.
  # @param  {String}    goldAmount        Amount of +gold to add to user.
  # @param  {String}    memo          Why did we change the wallet gold?
  # @param  {String}    sourceId        Which object did this gold come from?
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @giveUserGold: (trxPromise,trx,userId,goldAmount,memo,sourceId)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "modifyWalletGoldByAmount() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not modify gold in wallet : invalid user ID - #{userId}"))

    # goldAmount must be defined
    unless goldAmount
      Logger.module("InventoryModule").debug "modifyWalletGoldByAmount() -> invalid gold amount - #{goldAmount}.".red
      return Promise.reject(new Error("Can not modify gold in wallet : invalid gold amount - #{goldAmount}"))

    NOW_UTC_MOMENT = moment.utc()

    if goldAmount <= 0
      return Promise.resolve()

    Logger.module("InventoryModule").time "giveUserGold() -> User #{userId.blue}".green + " received #{goldAmount} gold.".green

    # trxPromise.then ()->
    #   return DuelystFirebase.connect().getRootRef()
    # .then (fbRootRef) ->
    #   updateWalletData = (walletData)->
    #     walletData ?= {}
    #     walletData.gold_amount ?= 0
    #     walletData.gold_amount += goldAmount
    #     walletData.updated_at = NOW_UTC_MOMENT.valueOf()
    #     return walletData

    #   return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)
    # # .catch (ex)->
    # #   Logger.module("InventoryModule").debug "giveUserGold() -> FIREBASE ERROR: User #{userId.blue}".red + " did not receive #{goldAmount} gold.".red
    # #   throw ex


    userCurrencyLogItem =
      id:          generatePushId()
      user_id:      userId
      gold:        goldAmount
      memo:        memo
      created_at:      NOW_UTC_MOMENT.toDate()

    return Promise.all([
      knex("users").where('id',userId).increment('wallet_gold',goldAmount).transacting(trx),
      knex("users").where('id',userId).increment('total_gold_earned',goldAmount).transacting(trx),
      knex("users").where('id',userId).update('wallet_updated_at',NOW_UTC_MOMENT.toDate()).transacting(trx),
      knex("user_currency_log").insert(userCurrencyLogItem).transacting(trx)
    ])
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      updateWalletData = (walletData)->
        walletData ?= {}
        walletData.gold_amount ?= 0
        walletData.gold_amount += goldAmount
        walletData.updated_at = NOW_UTC_MOMENT.valueOf()
        return walletData

      return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

    .then ()->
      Logger.module("InventoryModule").timeEnd "giveUserGold() -> User #{userId.blue}".green + " received #{goldAmount} gold.".green

  ###*
  # Give a user gold.
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add gold.
  # @param  {String}    goldAmount        Amount of gold to subtract in negative value (example: -100)
  # @param  {String}    memo          Why did we change the wallet gold?
  # @param  {String}    sourceId        Which object did this gold come from?
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @debitGoldFromUser: (trxPromise,trx,userId,goldAmount,memo,sourceId)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "debitGoldFromUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not modify gold in wallet : invalid user ID - #{userId}"))

    # goldAmount must be defined
    unless goldAmount
      Logger.module("InventoryModule").debug "debitGoldFromUser() -> invalid gold amount - #{goldAmount}.".red
      return Promise.reject(new Error("Can not modify gold in wallet : invalid gold amount - #{goldAmount}"))

    NOW_UTC_MOMENT = moment.utc()

    if goldAmount >= 0
      return Promise.resolve()

    Logger.module("InventoryModule").time "debitGoldFromUser() -> User #{userId.blue}".green + " received #{goldAmount} gold.".green

    userCurrencyLogItem =
      id:          generatePushId()
      user_id:      userId
      gold:        goldAmount
      memo:        memo
      created_at:      NOW_UTC_MOMENT.toDate()

    knex("users").where('id',userId).first('wallet_gold').transacting(trx)
    .then (userRow)->

      if userRow?.wallet_gold < Math.abs(goldAmount)
        throw new Errors.InsufficientFundsError()

      return Promise.all([
        knex("users").where('id',userId).increment('wallet_gold',goldAmount).transacting(trx),
        knex("users").where('id',userId).update('wallet_updated_at',NOW_UTC_MOMENT.toDate()).transacting(trx),
        knex("user_currency_log").insert(userCurrencyLogItem).transacting(trx)
      ])

    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      updateWalletData = (walletData)->
        walletData ?= {}
        walletData.gold_amount ?= 0
        walletData.gold_amount += goldAmount
        walletData.updated_at = NOW_UTC_MOMENT.valueOf()
        return walletData

      return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

    .then ()->

      Logger.module("InventoryModule").timeEnd "debitGoldFromUser() -> User #{userId.blue}".green + " received #{goldAmount} gold.".green

  ###*
  # Give a user spirit.
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add spirit.
  # @param  {String}    spiritAmount      Amount of +spirit to add to user.
  # @param  {String}    memo          Why did we change the wallet spirit?
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @giveUserSpirit: (trxPromise,trx,userId,spiritAmount,memo)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "modifyWalletSpiritByAmount() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not modify spirit in wallet : invalid user ID - #{userId}"))

    # spiritAmount must be defined
    unless spiritAmount?
      Logger.module("InventoryModule").debug "modifyWalletSpiritByAmount() -> invalid spirit amount - #{spiritAmount}.".red
      return Promise.reject(new Error("Can not modify spirit in wallet : invalid spirit amount - #{spiritAmount}"))

    NOW_UTC_MOMENT = moment.utc()

    if spiritAmount <= 0
      return Promise.resolve()

    Logger.module("InventoryModule").time "giveUserSpirit() -> User #{userId.blue}".green + " received #{spiritAmount} spirit.".green

    # trxPromise.then ()->
    #   return DuelystFirebase.connect().getRootRef()
    # .then (fbRootRef) ->
    #   updateWalletData = (walletData)->
    #     walletData ?= {}
    #     walletData.spirit_amount ?= 0
    #     walletData.spirit_amount += spiritAmount
    #     return walletData

    #   return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)
    # # .catch (ex)->
    # #   Logger.module("InventoryModule").debug "giveUserSpirit() -> FIREBASE ERROR: User #{userId.blue}".red + " did not receive #{spiritAmount} spirit.".red
    # #   throw ex

    userCurrencyLogItem =
      id:          generatePushId()
      user_id:      userId
      spirit:        spiritAmount
      memo:        memo
      created_at:      NOW_UTC_MOMENT.toDate()

    return Promise.all([
      knex("users").where('id',userId).increment('wallet_spirit',spiritAmount).transacting(trx),
      knex("users").where('id',userId).increment('total_spirit_earned',spiritAmount).transacting(trx),
      knex("users").where('id',userId).update('wallet_updated_at',NOW_UTC_MOMENT.toDate()).transacting(trx),
      knex("user_currency_log").insert(userCurrencyLogItem).transacting(trx)
    ])
    .then ()->
      return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      updateWalletData = (walletData)->
        walletData ?= {}
        walletData.spirit_amount ?= 0
        walletData.spirit_amount += spiritAmount
        return walletData

      return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)
    .then ()->

      Logger.module("InventoryModule").timeEnd "giveUserSpirit() -> User #{userId.blue}".green + " received #{spiritAmount} spirit.".green


  ###*
  # Give a user premium currency.
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add.
  # @param  {String}    amount        Amount of +premium currency to add to user.
  # @param  {String}    memo          Why did we change the wallet?
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @giveUserPremium: (trxPromise,trx,userId,amount,memo)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "modifyWalletPremiumByAmount() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not modify premium currency in wallet : invalid user ID - #{userId}"))

    # amount must be defined
    unless amount
      Logger.module("InventoryModule").debug "modifyWalletPremiumByAmount() -> invalid amount - #{amount}.".red
      return Promise.reject(new Error("Can not modify premium currency in wallet : invalid amount - #{amount}"))

    NOW_UTC_MOMENT = moment.utc()

    if amount <= 0
      return Promise.resolve()

    Logger.module("InventoryModule").time "giveUserPremium() -> User #{userId.blue}".green + " received #{amount}.".green

    userCurrencyLogItem =
      id:                generatePushId()
      user_id:          userId
      premium_currency:  amount
      memo:              memo
      created_at:        NOW_UTC_MOMENT.toDate()

    allPromises = [
      knex("users").where('id',userId).increment('wallet_premium',amount).transacting(trx),
      knex("users").where('id',userId).increment('total_premium_earned',amount).transacting(trx),
      knex("users").where('id',userId).update('wallet_updated_at',NOW_UTC_MOMENT.toDate()).transacting(trx)
    ]
    if memo
      knex("user_currency_log").insert(userCurrencyLogItem).transacting(trx)

    return Promise.all(allPromises)
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      updateWalletData = (walletData)->
        walletData ?= {}
        walletData.premium_amount ?= 0
        walletData.premium_amount += amount
        walletData.updated_at = NOW_UTC_MOMENT.valueOf()
        return walletData

      return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

    .then ()->
      Logger.module("InventoryModule").timeEnd "giveUserPremium() -> User #{userId.blue}".green + " received #{amount}.".green

  ###*
  # Debit a user gold.
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add.
  # @param  {String}    amount        Amount of +premium currency to subtract from the user.
  # @param  {String}    memo          Why did we change the wallet?
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @debitPremiumFromUser: (trxPromise,trx,userId,amount,memo)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "debitPremiumFromUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not modify premium currency in wallet : invalid user ID - #{userId}"))

    # amount must be defined
    unless amount
      Logger.module("InventoryModule").debug "debitPremiumFromUser() -> invalid amount - #{amount}.".red
      return Promise.reject(new Error("Can not modify premium currency in wallet : invalid amount - #{amount}"))

    NOW_UTC_MOMENT = moment.utc()

    if amount <= 0
      return Promise.resolve()

    Logger.module("InventoryModule").time "debitPremiumFromUser() -> User #{userId.blue}".green + " received #{amount}.".green

    userCurrencyLogItem =
      id:                generatePushId()
      user_id:          userId
      premium_currency:  amount
      memo:              memo
      created_at:        NOW_UTC_MOMENT.toDate()

    knex("users").where('id',userId).first('wallet_premium').transacting(trx)
    .then (userRow)->

      if userRow?.wallet_premium < amount
        throw new Errors.InsufficientFundsError()

      allPromises = [
        knex("users").where('id',userId).increment('wallet_premium',-amount).transacting(trx),
        knex("users").where('id',userId).update('wallet_updated_at',NOW_UTC_MOMENT.toDate()).transacting(trx)
      ]
      if memo
        allPromises.push knex("user_currency_log").insert(userCurrencyLogItem).transacting(trx)
      return Promise.all(allPromises)

    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      updateWalletData = (walletData)->
        walletData ?= {}
        walletData.premium_amount ?= 0
        walletData.premium_amount -= amount
        walletData.updated_at = NOW_UTC_MOMENT.valueOf()
        return walletData

      return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

    .then ()->

      Logger.module("InventoryModule").timeEnd "debitPremiumFromUser() -> User #{userId.blue}".green + " received #{amount}.".green

  ###*
    # Attempts to give a user a cosmetic they don't own (considering optional rarity filter and type filter), if they own all gives them a random one (which will get converted to spirit)
    # @public
    # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
    # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
    # @param  {String}    userId          User ID for which add spirit.
    # @param  {String}    transactionType  cosmetic_chest, achievement, or hard (for purchases)
    # @param  {String}    transactionId   id of purchase if hard, or source id related for soft
    # @param  {Rarity}    rarityId       RarityLookup to filter cosmetics to (optional, defaults to all rarities)
    # @param  {Array}      cosmeticIdsOwned    (optional) An array of integers representing the user's current inventory of owned cosmetics
    # @param  {CosmeticsType}    cosmeticType       CosmeticsTypeLookup to filter cosmetics to (optional, defaults to all types)
    # @return  {Promise}  Promise that will resolve to either {cosmetic_id:XXX} if they received cosmetic or {cosmetic_id:XXX,spirit:XXX} if they received spirit for a duplicate.
    ###
  @giveUserNewPurchasableCosmetic: (trxPromise,trx,userId,transactionType,transactionId,rarityId,cosmeticType,cosmeticIdsOwned,systemTime)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "giveUserNewPurchasableCosmetic() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not give user new cosmetic: invalid user ID - #{userId}"))

    # transaction details must be defined
    unless transactionType? and transactionId?
      Logger.module("InventoryModule").debug "giveUserNewPurchasableCosmetic() -> invalid transaction details: type - #{transactionType} id - #{transactionId}.".red
      return Promise.reject(new Error("Can not give user new cosmetic: invalid transaction details: type - #{transactionType} id - #{transactionId}"))

    # if cosmeticType is defined, it must be a valid type
    if cosmeticType? and !_.contains(_.values(SDK.CosmeticsTypeLookup),cosmeticType)
      Logger.module("InventoryModule").debug "giveUserNewPurchasableCosmetic() -> invalid cosmetic type: type - #{cosmeticType} user ID - #{userId}.".red
      return Promise.reject(new Error("Can not give user new cosmetic: invalid cosmetic type: type - #{cosmeticType} user ID - #{userId}"))

    if rarityId? and !_.contains(_.values(SDK.Rarity),rarityId)
      Logger.module("InventoryModule").debug "giveUserNewPurchasableCosmetic() -> invalid rarity type: type - #{rarityId} user ID - #{userId}.".red
      return Promise.reject(new Error("Can not give user new cosmetic: invalid rarity type: type - #{rarityId} user ID - #{userId}"))

    NOW_UTC_MOMENT = systemTime || moment.utc()

    Logger.module("InventoryModule").time "giveUserNewPurchasableCosmetic() -> User #{userId.blue}".green + " transactionType #{transactionType} cosmeticType #{cosmeticType} rarityId #{rarityId} .".green

    # Retrieve user's current cosmetic inventory (if it wasn't passed in)
    currentCosmeticInventoryPromise = null
    if cosmeticIdsOwned?
      currentCosmeticInventoryPromise = Promise.resolve(cosmeticIdsOwned)
    else
      currentCosmeticInventoryPromise = trx("user_cosmetic_inventory").where("user_id",userId)
      if cosmeticType?
        currentCosmeticInventoryPromise.andWhere("cosmetic_type",cosmeticType)
      currentCosmeticInventoryPromise.select("cosmetic_id")

      currentCosmeticInventoryPromise = currentCosmeticInventoryPromise.then (cosmeticRows) ->
        cosmeticIdsOwned = []
        if cosmeticRows?
          cosmeticIdsOwned = _.map(cosmeticRows, (cosmeticRow) -> return parseInt(cosmeticRow.cosmetic_id))
        return Promise.resolve(cosmeticIdsOwned)


    # First check if user already owns the cosmetic id
    return currentCosmeticInventoryPromise
    .bind {}
    .then (cosmeticIdsOwned) ->

      matchingPotentialCosmetics = []
      if cosmeticType? and rarityId?
        matchingPotentialCosmetics = SDK.CosmeticsFactory.cosmeticsForTypeAndRarity(cosmeticType,rarityId)
      else if cosmeticType?
        matchingPotentialCosmetics = SDK.CosmeticsFactory.cosmeticsForType(cosmeticType)
      else if rarityId?
        matchingPotentialCosmetics = SDK.CosmeticsFactory.cosmeticsForRarity(rarityId)
      else
        matchingPotentialCosmetics = SDK.CosmeticsFactory.getAllCosmetics()

      purchasablePotentialCosmetics = _.filter(matchingPotentialCosmetics, (cosmeticData) -> return cosmeticData.purchasable == true and cosmeticData.enabled == true)

      unownedMatchingCosmetics = _.filter(purchasablePotentialCosmetics, (cosmeticData) -> return not _.contains(cosmeticIdsOwned,cosmeticData.id))

      cosmeticIdToGive = null
      if unownedMatchingCosmetics.length != 0
        # Player doesn't own all of them, give one of the matching unowned
        # TODO: this could be optimized but for maintainability it used standard _ methods
        sortedUnownedMatchingCosmetics = _.sortBy(unownedMatchingCosmetics, (cosmeticData) -> return cosmeticData.rewardOrder)

        targetRewardOrder = sortedUnownedMatchingCosmetics[0].rewardOrder

        lowestOrderUnownedCosmetics = _.filter(sortedUnownedMatchingCosmetics,(cosmeticData) -> return cosmeticData.rewardOrder == targetRewardOrder)

        cosmeticIdToGive = _.sample(lowestOrderUnownedCosmetics).id
      else
        # If they own all of the unowned matching cosmetics, pick a random cosmetic matching rarity and cosmetic type which will end up being a duplicate
        cosmeticIdToGive = _.sample(purchasablePotentialCosmetics).id

      return InventoryModule.giveUserCosmeticId(trxPromise,trx,userId,cosmeticIdToGive,transactionType,transactionId,null,systemTime)
    .then (cosmeticRewardData) ->
      Logger.module("InventoryModule").timeEnd "giveUserNewPurchasableCosmetic() -> User #{userId.blue}".green + " transactionType #{transactionType} cosmeticType #{cosmeticType} rarityId #{rarityId} .".green

      return cosmeticRewardData

  ###*
  # Give a user a cosmetic id, or if they already own it give them spirit
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add spirit.
  # @param  {integer}    cosmeticId       CosmeticsLookup id of a cosmetic
  # @param  {String}    transactionType  cosmetic_chest, achievement, or hard (for purchases)
  # @param  {String}    transactionId   id of purchase if hard, or source id related for soft
  # @return  {Promise}  Promise that will resolve to either {cosmetic_id:XXX} if they received cosmetic or {cosmetic_id:XXX,spirit:XXX} if they received spirit for a duplicate.
  ###
  @giveUserCosmeticId: (trxPromise,trx,userId,cosmeticId,transactionType,transactionId,manualSpiritOverrideAmount,systemTime)->
    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "giveUserCosmeticId() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not give user cosmetic id : invalid user ID - #{userId}"))

    # cosmeticId must be defined
    unless cosmeticId?
      Logger.module("InventoryModule").debug "giveUserCosmeticId() -> invalid cosmetic id - #{cosmeticId}.".red
      return Promise.reject(new Error("Can not give user cosmetic id : invalid cosmetic ID - #{cosmeticId}"))

    # ensure cosmetic id is an integer
    cosmeticId = parseInt(cosmeticId)

    # cosmeticId must relate to a cosmetic id in cosmetic factory
    cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
    unless cosmeticData?
      Logger.module("InventoryModule").debug "giveUserCosmeticId() -> invalid cosmetic id - #{cosmeticId}.".red
      return Promise.reject(new Error("Can not give user cosmetic id : invalid cosmetic ID - #{cosmeticId}"))

    if !cosmeticData.enabled
      Logger.module("InventoryModule").debug "giveUserCosmeticId() -> disabled cosmetic id - #{cosmeticId}.".red
      return Promise.reject(new Error("Can not give user cosmetic id : disabled cosmetic ID - #{cosmeticId}"))

    # transaction details must be defined
    unless transactionType? and transactionId?
      Logger.module("InventoryModule").debug "giveUserCosmeticId() -> invalid transaction details: type - #{transactionType} id - #{transactionId}.".red
      return Promise.reject(new Error("Can not give user cosmetic id : invalid transaction details: type - #{transactionType} id - #{transactionId}"))

    NOW_UTC_MOMENT = systemTime || moment.utc()

    Logger.module("InventoryModule").time "giveUserCosmeticId() -> User #{userId.blue}".green + " received #{cosmeticId} cosmetic id.".green

    # First check if user already owns the cosmetic id
    return trx("user_cosmetic_inventory").where("user_id",userId).andWhere("cosmetic_id",cosmeticId).first("cosmetic_id")
    .bind {}
    .then (cosmeticRow) ->
      if cosmeticRow?
        Logger.module("InventoryModule").debug "giveUserCosmeticId() -> duplicate cosmetic id - #{cosmeticId}."
        cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
        cosmeticRarityId = cosmeticData.rarityId
        spiritValue = 0
        if cosmeticRarityId?
          spiritValue = SDK.RarityFactory.rarityForIdentifier(cosmeticRarityId).spiritRewardCosmetic

        # Safety check spirit override amount
        if manualSpiritOverrideAmount?
          manualSpiritOverrideAmount = parseInt(manualSpiritOverrideAmount)
          if _.isFinite(manualSpiritOverrideAmount) and (manualSpiritOverrideAmount >= 0) and (manualSpiritOverrideAmount <= spiritValue)
            spiritValue = manualSpiritOverrideAmount
          else #not _.isFinite(manualSpiritOverrideAmount) or not (manualSpiritOverrideAmount < spiritValue)
            return Promise.reject(new Errors.BadRequestError("Spirit Refund amount is higher than it should be for this rarity"))


        Logger.module("InventoryModule").debug "giveUserCosmeticId() -> duplicate cosmetic id - #{cosmeticId} giving user - #{userId} spirit #{spiritValue}."
        @.resValue = {
          spirit:spiritValue
          cosmetic_id:cosmeticId
        }
        if spiritValue > 0
          return InventoryModule.giveUserSpirit(trxPromise,trx,userId,spiritValue,"dupe cosmetic #{cosmeticId} trans type #{transactionType} trans id #{transactionId}")
        else
          return Promise.resolve()
      else
        cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
        cosmeticRowInsert = {
          user_id: userId
          cosmetic_id: cosmeticId
          cosmetic_type: cosmeticData.typeId
          sku: SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId).sku
          transaction_type: transactionType
          transaction_id: transactionId
          created_at: NOW_UTC_MOMENT.toDate()
        }
        @.resValue = {cosmetic_id:cosmeticId}
        return trx("user_cosmetic_inventory").insert(cosmeticRowInsert)
    .then ()->
      # Only need to update Firebase if we are giving a cosmetic, otherwise spirit gained is updated in giveUserSpirit
      if @.resValue.cosmetic_id? and not @.resValue.spirit?
        return DuelystFirebase.connect().getRootRef()
        .bind @
        .then (fbRootRef) ->
          fbCosmeticData = {
            cosmetic_id:@.resValue.cosmetic_id
            created_at:NOW_UTC_MOMENT.valueOf()
          }
          return FirebasePromises.set(fbRootRef.child('user-inventory').child(userId).child("cosmetic-inventory").child(@.resValue.cosmetic_id),fbCosmeticData)
      else
        return Promise.resolve()
    .then ()->
      Logger.module("InventoryModule").timeEnd "giveUserCosmeticId() -> User #{userId.blue}".green + " received #{cosmeticId} cosmetic id.".green
      return Promise.resolve(@.resValue)

  ###*
  # Check whether a user is allowed to use a list of cards.
  # NOTE: the user's owned card count will be checked against the number of instances of each card id found in the list!
  # @public
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID
  # @param  {Array}    cardIds      Card IDs
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @isAllowedToUseCards: (txPromise, tx, userId, cardIds) ->
    if !cardIds? or cardIds.length == 0
      return Promise.reject(new Errors.BadRequestError("No cards to validate"))

    # group cards by id to create counts
    cardIds = _.groupBy(cardIds)

    return Promise.all([
      tx("user_faction_progression").where('user_id', userId)
      tx("user_card_collection").where('user_id', userId).first()
    ])
    .spread (factionProgression,cardCollectionRow)->
      # map faction level by faction id
      factionLevel_FactionId = {}
      for factionData in SDK.FactionFactory.getAllEnabledFactions()
        factionId = factionData.id
        factionLevel = 0
        for factionProgressionRow in factionProgression
          if factionProgressionRow? and factionProgressionRow.faction_id == factionId
            factionLevel = SDK.FactionProgression.levelForXP(factionProgressionRow.xp)
        factionLevel_FactionId[factionId] = factionLevel

      for cardIdKey of cardIds
        numCards = cardIds[cardIdKey].length
        cardId = parseInt(cardIdKey)
        nonSkinnedCardId = SDK.Cards.getNonSkinnedCardId(cardId)

        # check for cards unlocked via progression
        levelRequiredForCard = SDK.FactionProgression.levelRequiredForCard(nonSkinnedCardId)
        if levelRequiredForCard > 0
          factionRequiredForCard = SDK.FactionProgression.factionRequiredForCard(nonSkinnedCardId)
          factionLevel = factionLevel_FactionId[factionRequiredForCard]
          unlockedCardIds = SDK.FactionProgression.unlockedCardsUpToLevel(factionLevel, factionRequiredForCard)
          if _.contains(unlockedCardIds, nonSkinnedCardId)
            continue

        # if we don't have any cards in the collection
        if not cardCollectionRow
          Logger.module("InventoryModule").error "isAllowedToUseCards() -> no cards found in player inventory - #{userId.blue}.".red
          return Promise.reject(new Errors.NotFoundError("No cards found in player inventory"))

        # if we don't have enough copies of the card in the collection
        unless cardCollectionRow?.cards[cardIdKey] and cardCollectionRow?.cards[cardIdKey].count >= numCards
          Logger.module("InventoryModule").error "isAllowedToUseCards() -> player doesn't own enough copies of card (id:#{cardIdKey}) - #{userId.blue}.".red
          return Promise.reject(new Errors.NotFoundError("Player doesn't own enough copies"))

      # Logger.module("InventoryModule").debug "isAllowedToUseCards() -> allowed to use all cards - #{userId.blue}.".green
      return Promise.resolve(true)

  ###*
  # Filters a list of cards down to those a user is allowed to use.
  # NOTE: the user's owned card count will be checked against the number of instances of each card id found in the list!
  # @public
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID
  # @param  {Array}    cardIds      Card IDs
  # @return  {Promise}                Promise that will resolve on completion with a list of usable card ids.
  ###
  @filterUsableCards: (txPromise, tx, userId, cardIds) ->
    if !cardIds? or cardIds.length <= 0
      return Promise.resolve([])

    # group cards by id to create counts
    cardIds = _.groupBy(cardIds)

    return Promise.all([
      tx("user_faction_progression").where('user_id', userId)
      tx("user_card_collection").where('user_id', userId).first()
    ])
    .spread (factionProgression,cardCollectionRow)->
      usableCards = []

      # map faction level by faction id
      factionLevel_FactionId = {}
      for factionData in SDK.FactionFactory.getAllEnabledFactions()
        factionId = factionData.id
        factionLevel = 0
        for factionProgressionRow in factionProgression
          if factionProgressionRow? and factionProgressionRow.faction_id == factionId
            factionLevel = SDK.FactionProgression.levelForXP(factionProgressionRow.xp)
        factionLevel_FactionId[factionId] = factionLevel

      for cardIdKey of cardIds
        numCards = cardIds[cardIdKey].length
        cardId = parseInt(cardIdKey)
        nonSkinnedCardId = SDK.Cards.getNonSkinnedCardId(cardId)

        # check for cards unlocked via progression
        levelRequiredForCard = SDK.FactionProgression.levelRequiredForCard(nonSkinnedCardId)
        if levelRequiredForCard > 0
          factionRequiredForCard = SDK.FactionProgression.factionRequiredForCard(nonSkinnedCardId)
          factionLevel = factionLevel_FactionId[factionRequiredForCard]
          unlockedCardIds = SDK.FactionProgression.unlockedCardsUpToLevel(factionLevel, factionRequiredForCard)
          if _.contains(unlockedCardIds, nonSkinnedCardId)
            for i in [0...numCards]
              usableCards.push(cardId)
            continue

        if cardCollectionRow?
          cardData = cardCollectionRow.cards[cardIdKey]
          if cardData?
            for i in [0...Math.min(cardData.count, numCards)]
              usableCards.push(cardId)

      return usableCards

  ###*
  # Check whether a user is allowed to use a cosmetic.
  # @public
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID
  # @param  {String}    cosmeticId      Cosmetic ID
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @isAllowedToUseCosmetic: (txPromise, tx, userId, cosmeticId) ->
    cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
    if !cosmeticData?
      # cosmetic doesn't exist
      return Promise.reject(new Errors.NotFoundError("Can't use cosmetic that doesn't exist"))

    if !cosmeticData.purchasable and !cosmeticData.unlockable
      # all users have all non-purchasable and non-unlockable cosmetics
      return Promise.resolve(true)

    # search user inventory
    return tx("user_cosmetic_inventory").where("user_id",userId).andWhere("cosmetic_id",cosmeticId).first()
    .bind {}
    .then (cosmeticRow) ->
      if !cosmeticRow?
        return Promise.reject(new Errors.NotFoundError("Can't use cosmetic that you don't own"))
      else
        return Promise.resolve(true)

  ###*
  # Check whether a user is allowed to use a list of cosmetics.
  # @public
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID
  # @param  {String}    cosmeticIds      Cosmetic IDs
  # @param  {String}    [cosmeticType=all]      Cosmetic Type
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @isAllowedToUseCosmetics: (txPromise, tx, userId, cosmeticIds, cosmeticType) ->
    if !cosmeticIds?
      return Promise.reject(new Errors.NotFoundError("Can't use cosmetic that doesn't exist"))

    if !_.isArray(cosmeticIds) then cosmeticIds = [cosmeticIds]

    if cosmeticIds.length <= 1
      return InventoryModule.isAllowedToUseCosmetic(txPromise, tx, userId, cosmeticIds[0])
    else
      query = tx("user_cosmetic_inventory").where("user_id",userId)
      if cosmeticType? then query = query.andWhere("cosmetic_type", cosmeticType)
      query = query.select("cosmetic_id")
      return query
      .bind {}
      .then (cosmeticRows) ->
        for cosmeticId in cosmeticIds
          cosmeticId = parseInt(cosmeticId)
          cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
          if not cosmeticData? or not cosmeticData.enabled
            return Promise.reject(new Errors.NotFoundError("Can't use cosmetic that doesn't exist"))

          if cosmeticData.purchasable or cosmeticData.unlockable
            found = false
            # all users have all non-purchasable and non-unlockable cosmetics
            for row in cosmeticRows
              if parseInt(row.cosmetic_id) == cosmeticId
                found = true
                break

            if !found
              return Promise.reject(new Errors.NotFoundError("Can't use cosmetics that you don't own"))

        return Promise.resolve(true)

  ###*
  # Filters a list of cosmetics to those a user is allowed to use.
  # @public
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID
  # @param  {String}    cosmeticIds      Cosmetic IDs
  # @param  {String}    [cosmeticType=all]      Cosmetic Type
  # @return  {Promise}                Promise that will resolve on completion with a list of usable cosmetic ids.
  ###
  @filterUsableCosmetics: (txPromise, tx, userId, cosmeticIds, cosmeticType) ->
    if !cosmeticIds? or cosmeticIds.length == 0
      return Promise.resolve([])

    return new Promise (resolve, reject) ->
      if !_.isArray(cosmeticIds) then cosmeticIds = [cosmeticIds]

      if cosmeticIds.length == 1
        return InventoryModule.isAllowedToUseCosmetic(txPromise, tx, userId, cosmeticIds[0])
        .then () ->
          resolve(cosmeticIds)
        .catch () ->
          resolve([])
      else
        usableCosmeticIds = []
        query = tx("user_cosmetic_inventory").where("user_id",userId)
        if cosmeticType? then query = query.andWhere("cosmetic_type", cosmeticType)
        query = query.select("cosmetic_id")
        return query
        .bind {}
        .then (cosmeticRows) ->
          for cosmeticId in cosmeticIds
            cosmeticId = parseInt(cosmeticId)
            cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
            if cosmeticData? and cosmeticData.enabled
              if !cosmeticData.purchasable and !cosmeticData.unlockable
                # all users have all non-purchasable and non-unlockable cosmetics
                usableCosmeticIds.push(cosmeticId)
              else
                for row in cosmeticRows
                  cosmeticRowId = parseInt(row.cosmetic_id)
                  if cosmeticRowId == cosmeticId
                    usableCosmeticIds.push(cosmeticId)

            return resolve(usableCosmeticIds)
        .catch (error) ->
          reject(error)

  ###*
  # Remove spirit from user.
  # @public
  # @param  {Promise}    trxPromise        Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx            KNEX transaction to attach this operation to.
  # @param  {String}    userId          User ID for which add spirit.
  # @param  {String}    spiritAmount      Amount of spirit to remove to user in negative value (example: -100)
  # @param  {String}    memo          Why did we change the wallet spirit?
  # @param  {String}    sourceId        Which object did this spirit come from?
  # @return  {Promise}                Promise that will resolve on completion.
  ###
  @debitSpiritFromUser: (trxPromise,trx,userId,spiritAmount,memo,sourceId)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "debitSpiritFromUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not modify spirit in wallet : invalid user ID - #{userId}"))

    # spiritAmount must be defined
    unless spiritAmount
      Logger.module("InventoryModule").debug "debitSpiritFromUser() -> invalid spirit amount - #{spiritAmount}.".red
      return Promise.reject(new Error("Can not modify spirit in wallet : invalid spirit amount - #{spiritAmount}"))

    NOW_UTC_MOMENT = moment.utc()

    if spiritAmount >= 0
      return Promise.resolve()

    Logger.module("InventoryModule").time "debitSpiritFromUser() -> User #{userId.blue}".green + " received #{spiritAmount} spirit.".green

    userCurrencyLogItem =
      id:          generatePushId()
      user_id:      userId
      spirit:        spiritAmount
      memo:        memo
      created_at:      NOW_UTC_MOMENT.toDate()

    knex("users").where('id',userId).first('wallet_spirit').transacting(trx)
    .then (userRow)->

      if userRow?.wallet_spirit < Math.abs(spiritAmount)
        throw new Errors.InsufficientFundsError()

      return Promise.all([
        knex("users").where('id',userId).increment('wallet_spirit',spiritAmount).transacting(trx),
        knex("users").where('id',userId).update('wallet_updated_at',NOW_UTC_MOMENT.toDate()).transacting(trx),
        knex("user_currency_log").insert(userCurrencyLogItem).transacting(trx)
      ])

    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      updateWalletData = (walletData)->
        walletData ?= {}
        walletData.spirit_amount ?= 0
        walletData.spirit_amount += spiritAmount
        walletData.updated_at = NOW_UTC_MOMENT.valueOf()
        return walletData

      return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

    .then ()->

      Logger.module("InventoryModule").timeEnd "debitSpiritFromUser() -> User #{userId.blue}".green + " received #{spiritAmount} spirit.".green



  ###*
  # Use soft currency (gold) to buy 1 or more booster packs for a user.
  # @public
  # @param  {String}  userId    User ID for which to buy a booster pack.
  # @param  {Number}  qty    number of booster packs to buy.
  # @param  {Number}  cardSetId    card set id to buy booster from
  # @return  {Promise}        Promise that will post BOOSTER PACK ID on completion.
  ###
  @buyBoosterPacksWithGold: (userId, qty, cardSetId, sku) ->
    unless userId
      Logger.module("InventoryModule").debug "buyBoosterPacksWithGold() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not buy booster pack with gold : invalid user ID - #{userId}"))

    if !qty? or isNaN(qty) or qty <= 0
      Logger.module("InventoryModule").debug "buyBoosterPacksWithGold() -> invalid quantity - #{qty}.".red
      return Promise.reject(new Error("Can not buy booster pack with gold : invalid quantity - #{qty}"))

    cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId)
    if !cardSetData? or !cardSetData.enabled or cardSetData.isPreRelease
      Logger.module("InventoryModule").debug "buyBoosterPacksWithGold() -> invalid card set - #{cardSetId}.".red
      return Promise.reject(new Error("Can not buy booster pack with gold : invalid card set - #{cardSetId}"))

    # Account for bundle discounts here.
    # TODO: This is a temporary hack. We should revisit the Gold vs. Premium flows entirely.
    if qty == 3
      total_gold_cost = 140
    else if qty == 10
      total_gold_cost = 450
    else if qty == 25
      total_gold_cost = 1050
    else if qty == 50
      total_gold_cost = 2000
    else
      total_gold_cost = qty * cardSetData.orbGoldCost

    Logger.module("InventoryModule").debug "buyBoosterPacksWithGold() -> user #{userId.blue} buying #{qty} #{if qty > 1 then "packs" else "pack"} from set #{cardSetId}"
    Logger.module("InventoryModule").time "buyBoosterPacksWithGold() -> bought by user #{userId.blue}.".green

    NOW_UTC_MOMENT = moment.utc()
    this_obj = { cardSetData: cardSetData }

    final_wallet_gold = null
    txPromise = knex.transaction (tx)->
      knex.first()
        .from('users')
        .where('id',userId)
        .transacting(tx)
        .forUpdate()
      .bind this_obj
      .then (userRow)->

        if sku == "STARTERBUNDLE_201604" and userRow.has_purchased_starter_bundle
          throw new Errors.AlreadyExistsError("Player already purchased the starter bundle.")

        # if the user has enough gold
        if userRow.wallet_gold >= total_gold_cost

          # calculate final gold
          final_wallet_gold = @.final_wallet_gold = userRow.wallet_gold - total_gold_cost

          # setup what to update the user params with
          userUpdateParams =
            wallet_gold:    final_wallet_gold
            wallet_updated_at:   NOW_UTC_MOMENT.toDate()
            has_purchased_starter_bundle: sku == "STARTERBUNDLE_201604"

          knex("users").where('id',userId).update(userUpdateParams).transacting(tx)

        else

          Logger.module("InventoryModule").debug "buyBoosterPacksWithGold() -> Cannot buy #{qty} booster #{if qty > 1 then "packs" else "pack"} because user #{userId.blue} due to insufficient funds".red
          return Promise.reject(new Errors.InsufficientFundsError("Insufficient funds in wallet to buy #{qty} booster #{if qty > 1 then "packs" else "pack"} for #{userId}"))

      .then ()->
        all = []
        for i in [0...qty]
          all.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,cardSetId,"soft"))
        return Promise.all(all)
      .then (boosterIds)->
        @.boosterIds = boosterIds
        return Promise.map(boosterIds, (boosterId) =>
          userCurrencyLogItem =
            id:          generatePushId()
            user_id:      userId
            gold:        -@.cardSetData.orbGoldCost
            memo:        "spirit orb #{boosterId}"
            created_at:      NOW_UTC_MOMENT.toDate()
          return knex.insert(userCurrencyLogItem).into("user_currency_log").transacting(tx)
        )
      .then ()->
        return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->

        if sku == "STARTERBUNDLE_201604"
          FirebasePromises.set(fbRootRef.child("users").child(userId).child("has_purchased_starter_bundle"),true)
          FirebasePromises.safeTransaction(fbRootRef.child("user-purchase-counts").child(userId).child(sku),(purchaseCountRecord)->
            return { count: 1 }
          )

        return FirebasePromises.update(fbRootRef.child("user-inventory").child(userId).child("wallet"),{
          gold_amount:@.final_wallet_gold
          updated_at:NOW_UTC_MOMENT.valueOf()
        })

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("InventoryModule").timeEnd "buyBoosterPacksWithGold() -> bought by user #{userId.blue}.".green

      return Promise.resolve(@.boosterIds)

    # return the transaction promise
    return txPromise

  ###*
  # Add a booster pack to a user's inventory for a specified transaction type.
  # @public
  # @param  {Promise}    trxPromise          Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx              KNEX transaction to attach this operation to.
  # @param  {String}    userId            User ID for which to buy a booster pack.
  # @param  {Integer}    cardSet            CardSetLookup value
  # @param  {String}    transactionType        'soft','hard','gauntlet', or 'xp'.
  # @param  {String}    transactionId        the identifier for the transaction that caused this booster to be added.
  # @param  {Object}    additionalBoosterAttrs    (OPTIONAL) Additional attributes to attach to the booster pack data.
  # @return  {Promise}    Promise that will post BOOSTER PACK DATA on completion.
  ###
  @addBoosterPackToUser: (trxPromise, trx, userId, cardSetId, transactionType, transactionId=null, additionalBoosterAttrs=null,systemTime)->


    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "addBoosterPackToUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not add booster pack : invalid user ID - #{userId}"))

    # userId must be defined
    unless trx
      Logger.module("InventoryModule").debug "addBoosterPackToUser() -> invalid trx - #{trx}.".red
      return Promise.reject(new Error("Can not add booster pack : invalid transaction parameter"))

    cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId)
    if !cardSetData? or !cardSetData.enabled
      Logger.module("InventoryModule").debug "addBoosterPackToUser() -> invalid card set - #{cardSetId}.".red
      return Promise.reject(new Error("Can not add booster pack : invalid card set - #{cardSetId}"))

    boosterId = generatePushId()

    Logger.module("InventoryModule").time "addBoosterPackToUser() -> added #{boosterId} to user #{userId.blue}.".green

    NOW_UTC_MOMENT = systemTime or moment.utc()

    # # when the transaction is done, update Firebase
    # trxPromise.then ()->
    #   return DuelystFirebase.connect().getRootRef()
    # .then (fbRootRef) ->
    #   boosters = fbRootRef.child("user-inventory").child(userId).child("spirit-orbs")
    #   booster_data =
    #     created_at:NOW_UTC_MOMENT.valueOf()
    #     transaction_type:transactionType
    #   return FirebasePromises.set(boosters.child(boosterId),booster_data)
    # .then ()->
    #   return Promise.resolve(boosterId)

    # return the insert statement and attach it to the transaction
    return trx("user_spirit_orbs").insert(
      id: boosterId
      user_id: userId
      transaction_type: transactionType
      transaction_id: transactionId
      params: additionalBoosterAttrs
      card_set: cardSetId
      created_at: NOW_UTC_MOMENT.toDate()
    ).bind {}
    .then ()->
      # If a set has a max number of orbs, make sure the user doesn't go over that
      orbCountTrackingPromise = Promise.resolve()

      if cardSetData.numOrbsToCompleteSet? > 0
        @.orbCountKey = "total_orb_count_set_" + cardSetId
        orbCountTrackingPromise = trx.raw("UPDATE users SET ?? = COALESCE(??,0) + 1 WHERE id = ? RETURNING ??",[@.orbCountKey,@.orbCountKey,userId,@.orbCountKey])
        .bind @
        .then (response)->
          if response? and response.rows? and response.rows[0]? and response.rows[0][@.orbCountKey]?
            orbCountAfter = response.rows[0][@.orbCountKey]
            if (orbCountAfter <= cardSetData.numOrbsToCompleteSet)
              @.setTotalOrbs = orbCountAfter
              return Promise.resolve()
            else
              return Promise.reject(new Errors.MaxOrbsForSetReachedError("Can not add booster pack : user already owns max orb count of this type"))
          else
            return Promise.reject(new Error("Can not add booster pack : invalid total sql orb count data for set - #{cardSetId}"))

      return orbCountTrackingPromise

    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      @.fbRootRef = fbRootRef
      allFbPromises = []

      # Add unopened spirit orb to user's firebase
      boosters = @.fbRootRef.child("user-inventory").child(userId).child("spirit-orbs")
      booster_data =
        created_at:NOW_UTC_MOMENT.valueOf()
        transaction_type:transactionType
        card_set:cardSetId
      allFbPromises.push(FirebasePromises.set(boosters.child(boosterId),booster_data))

      # If we are tracking orbs to set completion, write this data to fb
      if @.setTotalOrbs?
        newTotalOrbsForSet = @.setTotalOrbs
        allFbPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('spirit-orb-total').child(cardSetId),newTotalOrbsForSet))

      return Promise.all(allFbPromises)
    .then ()->
      Logger.module("InventoryModule").timeEnd "addBoosterPackToUser() -> added #{boosterId} to user #{userId.blue}.".green
      return Promise.resolve(boosterId)

  ###*
  # For a set that has a max number of orbs, this method purchases the rest of a card sets spirit orbs with spirit
  # @public
  # @param  {String}    userId            User ID for which to buy a booster pack.
  # @param  {Integer}    cardSetId            CardSetLookup value
  # @return  {Promise}    Promise that will post BOOSTER PACK DATA on completion.
  ###
  @buyRemainingSpiritOrbsWithSpirit: (userId, cardSetId, systemTime)->
    NOW_UTC_MOMENT = systemTime or moment.utc()

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "buyRemainingSpiritOrbsWithSpirit() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Errors.InvalidRequestError("Can not add complete card set with spirit : invalid user ID - #{userId}"))

    # cardSetId must be defined
    unless cardSetId?
      Logger.module("InventoryModule").debug "buyRemainingSpiritOrbsWithSpirit() -> invalid card set ID - #{cardSetId}.".red
      return Promise.reject(new Errors.InvalidRequestError("Can not add complete card set with spirit : invalid card set ID - #{cardSetId}"))

    sdkCardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId)
    unless sdkCardSetData?
      Logger.module("InventoryModule").debug "buyRemainingSpiritOrbsWithSpirit() -> invalid card set data - #{cardSetId}.".red
      return Promise.reject(new Errors.InvalidRequestError("Can not add complete card set with spirit : invalid card set data - #{cardSetId}"))

    if not sdkCardSetData.isUnlockableThroughOrbs or not sdkCardSetData.fullSetSpiritCost?
      Logger.module("InventoryModule").debug "buyRemainingSpiritOrbsWithSpirit() -> invalid card set for spirit purchase - #{cardSetId}.".red
      return Promise.reject(new Errors.InvalidRequestError("Can not add complete card set with spirit : invalid card set for spirit purchase - #{cardSetId}"))

    this_obj = {}

    this_obj.orbCountKey = "total_orb_count_set_" + cardSetId
    txPromise = knex.transaction (tx) ->
      return tx("users").first(this_obj.orbCountKey,"wallet_spirit").where("id",userId)
      .bind this_obj
      .then (userRow) ->
        @.setTotalOrbs = userRow[@.orbCountKey] || 0 # Number of orbs user already has for this set
        @.orbsRemaingToCompleteSet = sdkCardSetData.numOrbsToCompleteSet - @.setTotalOrbs

        if userRow.wallet_spirit < sdkCardSetData.fullSetSpiritCost
          Logger.module("InventoryModule").debug "buyRemainingSpiritOrbsWithSpirit() -> insufficient spirit for spirit purchase - #{cardSetId}.".red
          return Promise.reject(new Errors.InsufficientFundsError("Can not add complete card set with spirit : insufficient spirit for spirit purchase - #{cardSetId}"))

        transactionId = generatePushId()

        return Promise.all([
          InventoryModule.debitSpiritFromUser(txPromise,tx,userId,-1.0*sdkCardSetData.fullSetSpiritCost,"purchase full card set #{cardSetId}",transactionId),
          InventoryModule.addRemainingOrbsForCardSetToUser(txPromise,tx,userId,cardSetId,true,"soft",transactionId,NOW_UTC_MOMENT)
        ])
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
    .bind this_obj
    .then ()->

      Logger.module("InventoryModule").debug "buyRemainingSpiritOrbsWithSpirit() -> user #{userId.blue} ".green+" purchased remained of set #{cardSetId} with spirit".green

      # Resolves to the number of orbs gained
      return Promise.resolve(@.orbsRemaingToCompleteSet)


  ###*
  # For a set that has a max number of orbs, this method adds remainder amount of orbs and awards a refund for each orb already owned
  # @public
  # @param  {Promise}    trxPromise          Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx              KNEX transaction to attach this operation to.
  # @param  {String}    userId            User ID for which to buy a booster pack.
    # @param  {Integer}    cardSetId            CardSetLookup value
  # @param  {String}    transactionType        'soft','hard','gauntlet', or 'xp'.
  # @param  {String}    transactionId        the identifier for the transaction that caused this booster to be added.
  # @return  {Promise}    Promise that will post BOOSTER PACK DATA on completion.
  ###
  @addRemainingOrbsForCardSetToUser: (txPromise, tx, userId, cardSetId, refundWithSpirit, transactionType, transactionId=null, systemTime)->
    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not add complete card set : invalid user ID - #{userId}"))

    # userId must be defined
    unless tx
      Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> invalid trx - #{trx}.".red
      return Promise.reject(new Error("Can not add complete card set : invalid transaction parameter"))


    cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId)
    if !cardSetData? or !cardSetData.enabled
      Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> invalid card set - #{cardSetId}.".red
      return Promise.reject(new Error("Can not add complete card set : invalid card set - #{cardSetId}"))

    if !cardSetData? or !cardSetData.isUnlockableThroughOrbs or !cardSetData.numOrbsToCompleteSet?
      Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> card set is not unlocked exclusively through orbs - #{cardSetId}.".red
      return Promise.reject(new Error("Can not add complete card set : card set is not unlocked exclusively through orbs - #{cardSetId}"))

    if refundWithSpirit and !cardSetData.orbSpiritRefund?
      Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> card set cannot refund orbs with spirit - #{cardSetId}.".red
      #return Promise.reject(new Error("Can not add complete card set : card set cannot refund orbs with spirit - #{cardSetId}"))

    Logger.module("InventoryModule").time "addRemainingOrbsForCardSetToUser() -> added complete set for #{cardSetId} to user #{userId.blue}.".green

    NOW_UTC_MOMENT = systemTime or moment.utc()

    this_obj = {}
    orbCountTrackingPromise = Promise.resolve()

    this_obj.orbCountKey = "total_orb_count_set_" + cardSetId
    return tx("users").first(this_obj.orbCountKey).where("id",userId)
    .bind(this_obj)
    .then (userRow) ->

      @.setTotalOrbs = userRow[@.orbCountKey] || 0 # Number of orbs user already has for this set

      @.orbsToGive = cardSetData.numOrbsToCompleteSet - @.setTotalOrbs

      if (@.orbsToGive <= 0)
        Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> user already owns max orb count of this type - #{cardSetId}.".red
        return Promise.reject(new Errors.MaxOrbsForSetReachedError("Can not add complete card set : user already owns max orb count of this type"))

      allPromises = []
      Logger.module("InventoryModule").debug "addRemainingOrbsForCardSetToUser() -> adding #{@.orbsToGive} orbs to #{userId.blue}"
      for i in [1..@.orbsToGive]
        allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,cardSetId,transactionType,transactionId))

      if (@.setTotalOrbs? and @.setTotalOrbs > 0)
        if (refundWithSpirit and cardSetData.orbSpiritRefund?)
          allPromises.push(InventoryModule.giveUserSpirit(txPromise,tx,userId,(@.setTotalOrbs*cardSetData.orbGoldRefund),transactionType))
        else if (cardSetData.orbGoldRefund?)
          allPromises.push(InventoryModule.giveUserGold(txPromise,tx,userId,(@.setTotalOrbs*cardSetData.orbGoldRefund),transactionType,transactionId))

      return Promise.all(allPromises)
    .then () ->
      Logger.module("InventoryModule").timeEnd "addRemainingOrbsForCardSetToUser() -> added complete set for #{cardSetId} to user #{userId.blue}.".green


  ###*
  # Unlock a booster pack for a user and add the new cards to the user's inventory.
  # @public
  # @param  {String}  userId        User ID for which to open the booster pack.
  # @param  {String}  boosterPackId    Booster Pack ID to open.
  # @return  {Promise}            Promise that will post UNLOCKED BOOSTER PACK DATA on completion.
  # Tag: openBoosterPack openSpiritOrb
  ###
  @unlockBoosterPack: (userId, boosterPackId,systemTime) ->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "unlockBoosterPack() -> invalid user ID - #{userId.blue}.".red
      return Promise.reject(new Error("Can not unlock booster pack: invalid user ID - #{userId}"))

    this_obj = {}

    NOW_UTC_MOMENT = systemTime or moment.utc()

    Logger.module("InventoryModule").time "unlockBoosterPack() -> user #{userId.blue} unlocked booster #{boosterPackId}.".green

    txPromise = knex.transaction (tx)->

      Promise.all([
        tx('users').first('id').where('id',userId).forUpdate(),
        tx('user_spirit_orbs').first().where('id',boosterPackId).forUpdate()
      ])
      .bind this_obj
      .spread (userRow,boosterRow)->

        if not boosterRow? or boosterRow.user_id != userId
          return Promise.reject(new Errors.NotFoundError("The booster pack ID you provided does not exist or belong to you."))

        # if none set assume card set is Core
        boosterRow.card_set ?= SDK.CardSet.Core
        @.cardSetId = boosterRow.card_set

        # don't allow opening of non-existant or disabled card sets
        cardSetData = SDK.CardSetFactory.cardSetForIdentifier(@.cardSetId)
        if !cardSetData? or !cardSetData.enabled or cardSetData.isPreRelease
          throw new Errors.BadRequestError("You cannot open this type of Spirit Orb yet.")

        @.boosterRow = boosterRow

        needsPlayerInventory = false

        if @.cardSetId == SDK.CardSet.Bloodborn || @.cardSetId == SDK.CardSet.Unity
          needsPlayerInventory = true

        if needsPlayerInventory
          return tx('user_card_collection').first('cards').where('user_id',userId).forUpdate()
        else
          return Promise.resolve(null)

      .then (userCardsCollection)->

        @.userCardsData = {}
        if (userCardsCollection? and userCardsCollection?.cards?)
          @.userCardsData = userCardsCollection.cards


        return new Promise (resolve, reject) =>
          # New card Ids
          new_cards = []
          try

            # inline function for generating a random card from a specific set
            randomCardFromCollectionWithoutDupes = (cardsArray,notInCardsList,prismaticChance=0.0,maxIterations=50) ->
              cardId = null
              failsafe_counter = 0
              while cardId == null || _.contains(notInCardsList,cardId)
                randomIndex = Math.floor(Math.random() * (cardsArray.length))
                cardId = SDK.Cards.getBaseCardId(cardsArray[randomIndex])
                failsafe_counter++
                if failsafe_counter>maxIterations
                  break

              # card may be prismatic
              if Math.random() < prismaticChance
                cardId = SDK.Cards.getPrismaticCardId(cardId)

              return cardId

            randomUnownedCardFromCollection = (ownedCardsData,potentialCardPool) ->
              shuffledCardPool = _.shuffle(potentialCardPool)

              for cardId in shuffledCardPool
                if ownedCardsData[cardId]?.count and ownedCardsData[cardId]?.count > 0
                  continue
                else
                  return cardId
              throw new Error("unlockBoosterPack: Failed to find an unowned card")


            if @.cardSetId == SDK.CardSet.Core

              # fill slot 1 to 4
              for i in [1..4]
                random = Math.random()
                if random < 0.73
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.04,50))
                else if random < 0.88
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.06,50))
                else if random < 0.98
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.07,50))
                else
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.08,50))

              #fill slot 5
              random = Math.random()
              if random < 0.70
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.06,50))
              else if random < 0.82
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.07,50))
              else
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getIsLegacy(false).getCardIds(),new_cards,0.08,50))

            else if @.cardSetId == SDK.CardSet.Shimzar
              shimzarCommonPrismaticChance =     0.03
              shimzarRarePrismaticChance =       0.04
              shimzarEpicPrismaticChance =       0.06
              shimzarLegendaryPrismaticChance = 0.07
              # fill slot 1 to 4
              for i in [1..4]
                random = Math.random()
                if random < 0.74
                  # 74% chance for common
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarCommonPrismaticChance,50))
                else if random < (0.74 + 0.16)
                  # 16% chance for rare
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarRarePrismaticChance,50))
                else if random < (0.74 + 0.16 + 0.09)
                  # 9% chance for epic
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarEpicPrismaticChance,50))
                else
                  # 1% chance for legendary
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarLegendaryPrismaticChance,50))

              #fill slot 5
              random = Math.random()
              if random < 0.75
                # 75% chance for rare
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarRarePrismaticChance,50))
              else if random < (0.75 + 0.10)
                # 10% chance for epic
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarEpicPrismaticChance,50))
              else
                # 15% chance for legendary
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,shimzarLegendaryPrismaticChance,50))
            else if @.cardSetId == SDK.CardSet.Bloodborn || @.cardSetId == SDK.CardSet.Unity
              # 3 Of an unowned common
              commonCardId = randomUnownedCardFromCollection(@.userCardsData,SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsUnlockable(true).getIsPrismatic(false).getCardIds())
              new_cards.push(commonCardId)
              new_cards.push(commonCardId)
              new_cards.push(commonCardId)

              # 3 Of an unowned rare
              rareCardId = randomUnownedCardFromCollection(@.userCardsData,SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsUnlockable(true).getIsPrismatic(false).getCardIds())
              new_cards.push(rareCardId)
              new_cards.push(rareCardId)
              new_cards.push(rareCardId)

              # 3 Of an unowned epic or legendary (distribution determined by collective pool of epics and legendaries unowned)
              epicBloodbornCardIds = SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsUnlockable(true).getIsPrismatic(false).getCardIds()
              legendaryBloodbornCardIds = SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsUnlockable(true).getIsPrismatic(false).getCardIds()
              epicAndLegBbCardIds = epicBloodbornCardIds.concat(legendaryBloodbornCardIds)
              epicOrLegCardId = randomUnownedCardFromCollection(@.userCardsData,epicAndLegBbCardIds)
              new_cards.push(epicOrLegCardId)
              new_cards.push(epicOrLegCardId)
              new_cards.push(epicOrLegCardId)
            else if @.cardSetId == SDK.CardSet.FirstWatch
              firstwatchCommonPrismaticChance =     0.03
              firstwatchRarePrismaticChance =       0.04
              firstwatchEpicPrismaticChance =       0.06
              firstwatchLegendaryPrismaticChance = 0.07
              # fill slot 1 to 4
              for i in [1..4]
                random = Math.random()
                if random < 0.74
                  # 74% chance for common
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchCommonPrismaticChance,50))
                else if random < (0.74 + 0.16)
                  # 16% chance for rare
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchRarePrismaticChance,50))
                else if random < (0.74 + 0.16 + 0.09)
                  # 9% chance for epic
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchEpicPrismaticChance,50))
                else
                  # 1% chance for legendary
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchLegendaryPrismaticChance,50))

              #fill slot 5
              random = Math.random()
              if random < 0.75
                # 75% chance for rare
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchRarePrismaticChance,50))
              else if random < (0.75 + 0.10)
                # 10% chance for epic
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchEpicPrismaticChance,50))
              else
                # 15% chance for legendary
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,firstwatchLegendaryPrismaticChance,50))
            else if @.cardSetId == SDK.CardSet.Wartech
              wartechCommonPrismaticChance =     0.03
              wartechRarePrismaticChance =       0.04
              wartechEpicPrismaticChance =       0.06
              wartechLegendaryPrismaticChance = 0.07
              # fill slot 1 to 4
              for i in [1..4]
                random = Math.random()
                if random < 0.74
                  # 74% chance for common
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechCommonPrismaticChance,50))
                else if random < (0.74 + 0.16)
                  # 16% chance for rare
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechRarePrismaticChance,50))
                else if random < (0.74 + 0.16 + 0.09)
                  # 9% chance for epic
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechEpicPrismaticChance,50))
                else
                  # 1% chance for legendary
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechLegendaryPrismaticChance,50))

              #fill slot 5
              random = Math.random()
              if random < 0.75
                # 75% chance for rare
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechRarePrismaticChance,50))
              else if random < (0.75 + 0.10)
                # 10% chance for epic
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechEpicPrismaticChance,50))
              else
                # 15% chance for legendary
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,wartechLegendaryPrismaticChance,50))
            else if @.cardSetId == SDK.CardSet.CombinedUnlockables
              combinedCommonPrismaticChance =     0.03
              combinedRarePrismaticChance =       0.04
              combinedEpicPrismaticChance =       0.06
              combinedLegendaryPrismaticChance = 0.07
              # fill slot 1 to 4
              for i in [1..4]
                random = Math.random()
                if random < 0.74
                  # 74% chance for common
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedCommonPrismaticChance,50))
                else if random < (0.74 + 0.16)
                  # 16% chance for rare
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedRarePrismaticChance,50))
                else if random < (0.74 + 0.16 + 0.09)
                  # 9% chance for epic
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedEpicPrismaticChance,50))
                else
                  # 1% chance for legendary
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedLegendaryPrismaticChance,50))

              #fill slot 5
              random = Math.random()
              if random < 0.75
                # 75% chance for rare
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedRarePrismaticChance,50))
              else if random < (0.75 + 0.10)
                # 10% chance for epic
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedEpicPrismaticChance,50))
              else
                # 15% chance for legendary
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,combinedLegendaryPrismaticChance,50))
            else if @.cardSetId == SDK.CardSet.Coreshatter
              fateCommonPrismaticChance =     0.03
              fateRarePrismaticChance =       0.04
              fateEpicPrismaticChance =       0.06
              fateLegendaryPrismaticChance = 0.07
              # fill slot 1 to 4
              for i in [1..4]
                random = Math.random()
                if random < 0.74
                  # 74% chance for common
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateCommonPrismaticChance,50))
                else if random < (0.74 + 0.16)
                  # 16% chance for rare
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateRarePrismaticChance,50))
                else if random < (0.74 + 0.16 + 0.09)
                  # 9% chance for epic
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateEpicPrismaticChance,50))
                else
                  # 1% chance for legendary
                  new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateLegendaryPrismaticChance,50))

              #fill slot 5
              random = Math.random()
              if random < 0.75
                # 75% chance for rare
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateRarePrismaticChance,50))
              else if random < (0.75 + 0.10)
                # 10% chance for epic
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Epic).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateEpicPrismaticChance,50))
              else
                # 15% chance for legendary
                new_cards.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(@.cardSetId).getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(),new_cards,fateLegendaryPrismaticChance,50))
            else
              throw new Errors.BadRequestError("Unknown Card Set for Spirit Orb.")

          catch e
            reject(e)

          resolve(new_cards)
      .then (new_cards) ->

        @.new_cards = new_cards
        @.boosterRow.cards = new_cards
        @.boosterRow.opened_at = NOW_UTC_MOMENT.toDate()
        delete @.boosterRow.is_unread

        return Promise.all([
          knex("user_spirit_orbs").where('id',boosterPackId).delete().transacting(tx),
          knex.insert(@.boosterRow).into("user_spirit_orbs_opened").transacting(tx),
          InventoryModule.giveUserCards(txPromise,tx,userId,new_cards,"spirit orb",boosterPackId)
        ])
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->

        boosters = fbRootRef.child("user-inventory").child(userId).child("spirit-orbs")
        return FirebasePromises.remove(boosters.child(boosterPackId))

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("InventoryModule").debug "unlockBoosterPack() -> user #{userId.blue} ".green+" unlocked cards #{util.inspect(@.boosterRow.cards)} from booster #{@.boosterRow.id}".green

      Logger.module("InventoryModule").timeEnd "unlockBoosterPack() -> user #{userId.blue} unlocked booster #{boosterPackId}.".green
      # Kick off job to update acheivements based on spirit orbs opened
      Jobs.create("update-user-achievements",
        name: "Update User Spirit Orbs Achievements"
        title: util.format("User %s :: Update Spirit Orbs Achievements", userId)
        userId: userId
        spiritOrbOpenedFromSet: @.boosterRow.card_set
      ).removeOnComplete(true).save()

      return Promise.resolve(@.boosterRow)

  ## ---
  ###*
  # Checks for any codex chapters that a user is missing and gives them
  # @public
  # @param  {String}    userId              User ID for which to buy a booster pack.
  # @param  {Moment}    systemTime          System time input parameter. Useful for unit testing.
  # @return  {Promise}    Promise that will post the given chapter ids on completion
  ###
  # TODO: better error types
  @giveUserMissingCodexChapters: (userId, systemTime)->

    Logger.module("InventoryModule").time "giveUserMissingCodexChapters() -> checking for missing codex chapters for user ID #{userId.blue}.".green

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "giveUserMissingCodexChapters() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not check for missing codex chapters : invalid user ID - #{userId}"))

    NOW_UTC_MOMENT = systemTime || moment.utc()
    this_obj = {}

    txPromise = knex.transaction (tx) ->
      Promise.all([
        knex('user_progression').where('user_id',userId).first("game_count").transacting(tx),
        knex('user_codex_inventory').where('user_id',userId).select('chapter_id').transacting(tx).forUpdate()
      ])
      .bind this_obj
      .spread (progressionRow,codexInventoryRows) ->
        gameCount = 0
        if progressionRow?.game_count?
          gameCount = progressionRow.game_count

        earnedCodexChapterIds = SDK.Codex.chapterIdsOwnedByGameCount(gameCount)
        missingCodexChapterIds = _.filter(earnedCodexChapterIds, (earnedCodexChapterId) ->
          correspondingCodexChapterRow = _.find(codexInventoryRows,(codexInventoryRow) -> return codexInventoryRow.chapter_id == earnedCodexChapterId)
          return correspondingCodexChapterRow != null
        )

        if missingCodexChapterIds.length == 0
          return Promise.resolve([])
        else
          return Promise.map(missingCodexChapterIds, (missingCodexChapterId) ->
            return InventoryModule.giveUserCodexChapter(txPromise,tx,userId,missingCodexChapterId,NOW_UTC_MOMENT)
          )
      .then (results) ->
        this_obj.awardedChapterIds = _.filter(results, (result) -> return result != null)
      .then tx.commit
      .catch (e)->
        Logger.module("InventoryModule").debug "giveUserMissingCodexChapters() -> ROLLBACK ... #{e?.message}"
        tx.rollback()
      return
    .bind this_obj
    .then () ->
      Logger.module("InventoryModule").timeEnd "giveUserMissingCodexChapters() -> checking for missing codex chapters for user ID #{userId.blue}.".green
      return Promise.resolve(this_obj.awardedChapterIds)

  ###*
  # Add a booster pack to a user's inventory for a specified transaction type.
  # @public
  # @param  {Promise}    txPromise            Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  tx                KNEX transaction to attach this operation to.
  # @param  {String}    userId              User ID for which to buy a booster pack.
  # @param  {integer}    chapterId            ID of codex chapter to give user
  # @param  {Moment}    systemTime          System time input parameter. Useful for unit testing.
  # @return  {Promise}    Promise that will post the given chapter id on completion IF GIVEN (will not give duplicates).
  ###
  # TODO: better error types
  @giveUserCodexChapter: (txPromise, tx, userId, chapterId, systemTime)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "giveUserCodexChapter() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not give codex chapter : invalid user ID - #{userId}"))

    # chapterId must be defined
    unless chapterId
      Logger.module("InventoryModule").debug "giveUserCodexChapter() -> invalid chapter ID - #{chapterId} to user ID - #{userId}.".red
      return Promise.reject(new Error("Can not give codex chapter : invalid chapter ID - #{chapterId} to user ID - #{userId}"))

    chapterId = parseInt(chapterId)

    # userId must be defined
    unless tx
      Logger.module("InventoryModule").debug "giveUserCodexChapter() -> invalid trx - #{tx}.".red
      return Promise.reject(new Error("Can not give codex chapter : invalid transaction parameter"))

    # validate it's a valid chapter id with codex chapter factory
    sdkCodexChapter = SDK.Codex.chapterForIdentifier(chapterId)
    unless sdkCodexChapter
      Logger.module("InventoryModule").debug "giveUserCodexChapter() -> unknown chapter ID - #{chapterId}.".red
      return Promise.reject(new Error("Can not give codex chapter : unknown chapter ID - #{chapterId}"))

    NOW_UTC_MOMENT = systemTime || moment.utc()
    this_obj = {}

    Logger.module("InventoryModule").time "giveUserCodexChapter() -> added #{chapterId} to user ID #{userId.blue}.".green

    # return the insert statement and attach it to the transaction
    return knex('user_codex_inventory').where('user_id',userId).select('chapter_id').transacting(tx).forUpdate()
    .bind this_obj
    .then (codex_inventory_rows) ->

      @.codex_inventory_rows = codex_inventory_rows

      existingCodexChapterRow = _.find(@.codex_inventory_rows, (codexInventoryRow) ->
        return codexInventoryRow.chapter_id == chapterId
      )

      if existingCodexChapterRow
        @.userAlreadyOwnedChapter = true
        Logger.module("InventoryModule").debug "giveUserCodexChapter() -> attempting to give an already owned chapter ID - #{chapterId} to user ID - #{userId.blue}.".yellow
        return Promise.resolve()
      else
        @.new_codex_inventory_row =
          user_id: userId
          chapter_id: chapterId
          updated_at: NOW_UTC_MOMENT.toDate()
          created_at: NOW_UTC_MOMENT.toDate()

        # Place data in fb for storage after the transaction has completed
        fbCodexInventoryChapterData =
          chapter_id: chapterId
          is_unread: true
          updated_at: NOW_UTC_MOMENT.valueOf()
          created_at: NOW_UTC_MOMENT.valueOf()

        txPromise.then () ->
          DuelystFirebase.connect().getRootRef()
          .then (fbRootRef) ->
            return Promise.all([
              FirebasePromises.set(fbRootRef.child('user-inventory').child(userId).child('codex').child(chapterId),fbCodexInventoryChapterData)
            ])

        return knex.insert(@.new_codex_inventory_row).into("user_codex_inventory").transacting(tx)
    .then ()->

      Logger.module("InventoryModule").timeEnd "giveUserCodexChapter() -> added #{chapterId} to user ID #{userId.blue}.".green
      if @.userAlreadyOwnedChapter
        return Promise.resolve(null)
      else
        return Promise.resolve(chapterId)
  ## ---

  ###*
  # Disenchant cards in the user's inventory.
  # @public
  # @param  {String}  userId    User ID.
  # @param  {Array}    cardIds    Array of Integers for cardIds to dis-enchant.
  # @return  {Promise}        Resulting data object containing spirit and bonuses
  ###
  @disenchantCards: (userId,cardIds,systemTime) ->


    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "disenchantCards() -> invalid user ID - #{userId.blue}.".red
      return Promise.reject(new Error("Can not disenchant cards: invalid user ID - #{userId}"))

    # userId must be defined
    unless cardIds
      Logger.module("InventoryModule").debug "disenchantCards() -> invalid user card list - #{userId.blue}.".red
      return Promise.reject(new Error("Can not disenchant cards: invalid card list - #{userId}"))

    Logger.module("InventoryModule").debug "disenchantCards() -> user #{userId?.blue}".green + " disenchanting cards #{util.inspect(cardIds)}"
    # Logger.module("InventoryModule").time "disenchantCards() -> user #{userId.blue}".green + " disenchanted cards #{util.inspect(cardIds)}".green

    # used to make sure all updates have the same "updated_at" date
    NOW_UTC_MOMENT = systemTime || moment.utc()

    # the object to bind the promises to for data sharing
    this_obj = {}

    txPromise = knex.transaction (tx)->

      InventoryModule._disenchantCards(txPromise,tx,userId,cardIds,NOW_UTC_MOMENT)
      .bind this_obj
      .then (data)-> _.extend(@,data)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("InventoryModule").debug "disenchantCards() -> user #{userId.blue}".green + " disenchanted cards #{util.inspect(cardIds)}".green

      Jobs.create("update-user-achievements",
        name: "Update User Disenchanting Achievements"
        title: util.format("User %s :: Update Disenchanting Achievements", userId)
        userId: userId
        disenchantedCardIdList: cardIds
      ).removeOnComplete(true).save()

      return {
        wallet:
          spirit_amount:@.final_wallet_spirit
          gold_amount:@.userRow.gold_amount
          updated_at:NOW_UTC_MOMENT.valueOf()
        rewards:@.rewards
      }

    return txPromise

  ###*
  # Disenchant cards in the user's inventory.
  # @private
  # @param  {Promise}    trxPromise    Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx        KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID.
  # @param  {Array}      cardIds      Array of INT card IDs to disenchant.
  # @return  {Promise}            Resulting data object containing spirit and bonuses
  ###
  @_disenchantCards: (trxPromise,trx,userId,cardIds,systemTime)->

    # used to make sure all updates have the same "updated_at" date
    NOW_UTC_MOMENT = systemTime || moment.utc()

    # make sure all card ids are integers
    cardIds = _.map(cardIds,(cardId) -> return parseInt(cardId))

    # used to coalesce counts of cards in cardIds list to objects with count property
    cardDataListReduced = _.reduce(cardIds,((memo,cardId)->
      memo[cardId] ?=
        card_id:cardId
        count:0
      memo[cardId].count += 1
      return memo
    ),{})

    # attempt to lock user record first
    return trx.first('wallet_spirit').from("users").where('id',userId).forUpdate()
    .bind {}
    .then (userRow)->
      @.userRow = userRow
      return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->

      @.fbRootRef = fbRootRef

      # TODO: this should probably be moved to a redis / mem CACHE... it's a frequently read and infrequently updated value
      disenchantPromosRef = @.fbRootRef.child("crafting").child("promos").child("disenchant")
      @.disenchantPromos = []

      return FirebasePromises.once(disenchantPromosRef,'value')
    .then (promosSnapshot)->

      @.disenchantPromos = promosSnapshot.val()
      return @.disenchantPromos

    .then ()-> return trx.select().from("user_cards").whereIn('card_id',cardIds).andWhere('user_id',userId).forUpdate()
    .then (cardCountRows)->

      Logger.module("InventoryModule").debug "_disenchantCards cardRows:",cardCountRows

      @.cardCountRows = cardCountRows

      for disenchantedCardId,disenchantedCardData of cardDataListReduced
        countRow = _.find(cardCountRows,(row) ->
          return parseInt(row.card_id) == parseInt(disenchantedCardId)
        )
        if not countRow or countRow.count < disenchantedCardData.count
          throw new Errors.NotFoundError("User does not have cards he/she is trying to disenchant.")

      return Promise.resolve()
    # This next then is arbitrary and can be merge with preceeding one
    # But keeping so concerns are clearly seperated
    .then () ->

      @.rewards = []
      @.total_spirit_gained = 0

      for cardId in cardIds

        # STEP1 ... compute and roll/generate all the dis-enchanting rewards
        spirit_gained = 0

        try

          cardData = SDK.GameSession.getCardCaches().getIsCollectible(true).getCardById(parseInt(cardId))

          if not cardData?
            Logger.module("InventoryModule").debug "disenchantCards() -> ERROR: #{userId} is trying to disenchant a non-collectible card #{cardId}".red
            throw new Errors.NotFoundError("You cannot disenchant non-collectible cards.")

          # if any of the cards in the disenchant list are FIXED, just abort the whole process
          if cardData.getRarityId() == SDK.Rarity.Fixed || cardData.getRarityId() == SDK.Rarity.TokenUnit
            Logger.module("InventoryModule").debug "disenchantCards() -> ERROR: #{userId} is trying to disenchant a fixed card #{cardId}".red
            throw new Errors.BadRequestError("You cannot disenchant BASIC cards.")

          if cardData.getIsUnlockable() and !cardData.getIsUnlockablePrismaticWithAchievement() && !cardData.getIsUnlockablePrismaticWithSpiritOrbs()
            Logger.module("InventoryModule").debug "disenchantCards() -> ERROR: #{userId} is trying to craft an unlockable card #{cardId}".red
            throw new Errors.BadRequestError("You cannot disenchant UNLOCKABLE cards.")

          baseCardId = cardData.getBaseCardId()
          isPrismatic = SDK.Cards.getIsPrismaticCardId(cardData.getId())

          # NOTE: since we're using whereIn above, the card query will not include the base card for unlockable achievements and thus the code below would fail.
          # Also, In essence it's redundant to check if they have a base unlockable card since they can't craft an unlockable prismatic until they have the unlockable base card

          # # when disenchanting prismatic unlockable achievement cards
          # # ensure the normal version of the card has been unlocked
          # if cardData.getIsUnlockableWithAchievement() and cardData.getIsUnlockablePrismaticWithAchievement()
          #   baseCardRow = _.find(@.cardCountRows,(row) ->
          #     return parseInt(row.card_id) == parseInt(baseCardId)
          #   )
          #   if !baseCardRow? or !baseCardRow.count? or baseCardRow.count <= 0
          #     Logger.module("InventoryModule").debug "disenchantCards() -> ERROR: user #{userId.blue} ".red+" has not unlocked achievement for normal version to disenchant prismatic card #{cardId}".red
          #     throw new Errors.BadRequestError("You cannot disenchant UNLOCKABLE prismatic cards until the normal version is unlocked")

          rarityData = SDK.RarityFactory.rarityForIdentifier(cardData.getRarityId())
          if @.disenchantPromos and @.disenchantPromos[baseCardId.toString()] and (!@.disenchantPromos[baseCardId.toString()]["expires_at"] || NOW_UTC_MOMENT.valueOf() < @.disenchantPromos[baseCardId.toString()]["expires_at"])
            spirit_gained = @.disenchantPromos[baseCardId].spirit
            if spirit_gained == "COST"
              if isPrismatic
                spirit_gained = rarityData.spiritCostPrismatic
              else
                spirit_gained = rarityData.spiritCost
            # Logger.module("InventoryModule").debug("Disenchant promo for #{cardData.id} expires on #{@.disenchantPromos[cardData.id]["expires_at"]} -> #{moment(@.disenchantPromos[cardData.id]["expires_at"]).format("LLL")} vs now #{CURRENT_TIME_VAL} -> #{moment(CURRENT_TIME_VAL).format("LLL")}")
          else
            if isPrismatic
              spirit_gained = rarityData.spiritRewardPrismatic
            else
              spirit_gained = rarityData.spiritReward

        catch e
          Logger.module("InventoryModule").debug "disenchantCards() -> ERROR calculating bonuses ... user #{userId.blue}".red, e
          throw e

        @.total_spirit_gained += spirit_gained

        @.rewards.push
          card_id:cardId
          spirit_gained: spirit_gained

      return Promise.resolve(@rewards)

    .then (rewards)->

      @.final_wallet_spirit = @.userRow.wallet_spirit + @.total_spirit_gained

      return InventoryModule.giveUserSpirit(trxPromise,trx,userId,@.total_spirit_gained,"disenchant")

      # userUpdateParams =
      #   wallet_spirit:@.final_wallet_spirit
      #   wallet_updated_at:NOW_UTC_MOMENT.toDate()
      #   total_spirit_earned:@.userRow.total_spirit_earned + @.total_spirit_gained

      # currencyLogInsertParams =
      #   id:generatePushId()
      #   user_id:userId
      #   spirit:@.total_spirit_gained
      #   memo:"disenchant"

      # return Promise.all([
      #   knex("users").where('id',userId).update(userUpdateParams).transacting(trx),
      #   knex.insert(currencyLogInsertParams).into("user_currency_log").transacting(trx)
      # ])

    .then ()->

      # queries to promisify
      allQueries = []

      for deCardId,deCardData of cardDataListReduced

        countRow = _.find(@.cardCountRows,(row)-> parseInt(row.card_id) == parseInt(deCardId))

        countRow.count -= deCardData.count

        updateParams =
          count:countRow.count
          updated_at:NOW_UTC_MOMENT.toDate()

        if updateParams.count == 0
          allQueries.push(knex("user_cards").where({'user_id':userId,'card_id':deCardId}).delete().transacting(trx))
        else
          allQueries.push(knex("user_cards").where({'user_id':userId,'card_id':deCardId}).update(updateParams).transacting(trx))

      for cardId in cardIds
        # update card log
        allQueries.push(knex.insert(
          id:generatePushId()
          user_id:userId
          card_id:cardId
          is_credit:false
          source_type:"disenchant"
          created_at:NOW_UTC_MOMENT.toDate()
        ).into("user_card_log").transacting(trx))

      # resolve when all queries done
      return Promise.all(allQueries)
    .then ()-> return InventoryModule._refreshUserCardCollection(trxPromise,trx,userId,@.cardCountRows)
    .then ()->
      # return the data accumulated in this_obj
      return @

  ###*
  # Disenchant all duplicate cards in the user's inventory.
  # @public
  # @param  {String}  userId    User ID.
  # @return  {Promise}        Resulting data object containing spirit and bonuses
  ###
  @disenchantDuplicateCards: (userId,systemTime) ->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "disenchantDuplicateCards() -> invalid user ID - #{userId.blue}.".red
      return Promise.reject(new Error("Can not disenchant cards: invalid user ID - #{userId}"))

    NOW_UTC_MOMENT = systemTime || moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      knex('users').where('id',userId).first('id').transacting(tx).forUpdate()
      .bind this_obj
      .then (userRow)->
        return knex('user_card_collection').where('user_id',userId).first().transacting(tx).forUpdate()
      .then (collectionRow)->
        @.cardIds = []
        cardsCache = SDK.GameSession.getCardCaches().getIsCollectible(true).getIsUnlockable(false)
        for cardId,cardData of collectionRow.cards
          if cardData.count > 3
            if cardsCache.getCardById(parseInt(cardId))?
              for i in [3 ... cardData.count]
                @.cardIds.push(cardId)

        Logger.module("InventoryModule").debug "disenchantDuplicateCards() -> #{userId.blue} disenchanting #{util.inspect(@.cardIds)}."

      .then ()-> return InventoryModule._disenchantCards(txPromise,tx,userId,@.cardIds,NOW_UTC_MOMENT)
      .then (data)-> _.extend(@,data)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("InventoryModule").debug "disenchantDuplicateCards() -> user #{userId.blue}".green + " disenchanted cards #{util.inspect(@.cardIds)}".green

      Jobs.create("update-user-achievements",
        name: "Update User Disenchanting Achievements"
        title: util.format("User %s :: Update Disenchanting Achievements", userId)
        userId: userId
        disenchantedCardIdList: @.cardIds
      ).removeOnComplete(true).save()

      return {
        wallet:
          spirit_amount:@.final_wallet_spirit
          gold_amount:@.userRow.wallet_gold
          updated_at:NOW_UTC_MOMENT.valueOf()
        rewards:@.rewards
      }

    return txPromise

  ###*
  # Craft a card for a user.
  # @public
  # @param  {String}  userId    User ID.
  # @param  {Array}    cardId    CardID to craft.
  # @return  {Promise}        Resulting data object containing crafted card and resulting inventory data
  ###
  @craftCard: (userId,cardId) ->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "craftCard() -> invalid user ID - #{userId.blue}.".red
      return Promise.reject(new Error("Can not disenchant cards: invalid user ID - #{userId}"))

    # userId must be defined
    unless cardId
      Logger.module("InventoryModule").debug "craftCard() -> invalid user cardId - #{userId.blue}.".red
      return Promise.reject(new Error("Can not disenchant cards: invalid cardId - #{userId}"))

    NOW_UTC_MOMENT = moment().utc()

    rewards = []
    total_spirit_gained = 0

    # make sure card id is an integer
    cardId = parseInt(cardId)

    cardData = SDK.GameSession.getCardCaches().getIsCollectible(true).getCardById(cardId)

    Logger.module("InventoryModule").time "craftCard() -> user #{userId.blue} ".green+" crafted card #{cardId}".green

    # if there is no collectible card with the cardId, just abort the whole process
    if not cardData?
      Logger.module("InventoryModule").debug "craftCard() -> ERROR: #{userId} is trying to craft a an unknown card #{cardId}".red
      return Promise.reject(new Errors.BadRequestError("No collectible card with ID: #{cardId}."))

    # if the card is not available yet, abort
    if not cardData.getIsAvailable()
      Logger.module("InventoryModule").debug "craftCard() -> ERROR: #{userId} is trying to craft a an unavailable card #{cardId}".red
      return Promise.reject(new Errors.BadRequestError("Could not craft card #{cardId}. It's not yet available."))

    # if any of the cards in the disenchant list are FIXED, just abort the whole process
    if cardData.getRarityId() == SDK.Rarity.Fixed || cardData.getRarityId() == SDK.Rarity.TokenUnit
      Logger.module("InventoryModule").debug "craftCard() -> ERROR: #{userId} is trying to craft a fixed card #{cardId}".red
      return Promise.reject(new Errors.BadRequestError("You cannot craft BASIC cards."))

    if cardData.getIsUnlockable() and !cardData.getIsUnlockablePrismaticWithAchievement() and !cardData.getIsUnlockablePrismaticWithSpiritOrbs()
      Logger.module("InventoryModule").debug "craftCard() -> ERROR: #{userId} is trying to craft an unlockable card #{cardId}".red
      return Promise.reject(new Errors.BadRequestError("You cannot craft UNLOCKABLE cards."))

    isPrismatic = SDK.Cards.getIsPrismaticCardId(cardData.getId())
    rarityData = SDK.RarityFactory.rarityForIdentifier(cardData.getRarityId())
    if isPrismatic
      spirit_cost = rarityData.spiritCostPrismatic
    else
      spirit_cost = rarityData.spiritCost

    this_obj = {}

    txPromise = knex.transaction (tx)->

      tx("users").first('wallet_spirit','wallet_gold').where('id',userId).forUpdate()
      .bind this_obj
      .then (userRow)->

        @.userRow = userRow

        # when crafting prismatic unlockable achievement cards
        # ensure the normal version of the card has been unlocked
        requiresBaseCardIdToCraft = false
        requiresBaseCardIdToCraft |= (cardData.getIsUnlockableWithAchievement() and cardData.getIsUnlockablePrismaticWithAchievement())
        requiresBaseCardIdToCraft |= (cardData.getIsUnlockableThroughSpiritOrbs() and cardData.getIsUnlockablePrismaticWithSpiritOrbs())
        if requiresBaseCardIdToCraft
          baseCardId = SDK.Cards.getBaseCardId(cardId)
          return tx('user_cards').first().where({'user_id': userId, 'card_id': baseCardId })
          .then (baseCardRow) ->
            if !baseCardRow? or !baseCardRow.count? or baseCardRow.count <= 0
              Logger.module("InventoryModule").debug "craftCard() -> ERROR: user #{userId.blue} ".red+" has not unlocked achievement for normal version to craft prismatic card #{cardId}".red
              return Promise.reject(new Errors.BadRequestError("You cannot craft UNLOCKABLE prismatic cards until the normal version is unlocked"))
        else
          return Promise.resolve()

      .then ()->

        if @.userRow.wallet_spirit < spirit_cost
          Logger.module("InventoryModule").debug "craftCard() -> ERROR: user #{userId.blue} ".red+" has insufficient spirit (#{@.userRow.wallet_spirit}) to craft card #{cardId}".red
          return Promise.reject(new Errors.InsufficientFundsError("Insufficient resources in wallet to craft #{cardId} - #{userId}"))

        @.userRow.wallet_spirit -= spirit_cost

        userCurrencyLogItem =
          id:          generatePushId()
          user_id:      userId
          spirit:        -spirit_cost
          memo:        'craft'
          created_at:      NOW_UTC_MOMENT.toDate()

        userUpdateParams =
          wallet_spirit: @.userRow.wallet_spirit
          wallet_updated_at: NOW_UTC_MOMENT.toDate()

        return Promise.all([
          InventoryModule.giveUserCards(txPromise,tx,userId,[cardId],"craft")
          knex("users").where('id',userId).update(userUpdateParams).transacting(tx)
          knex("user_currency_log").insert(userCurrencyLogItem).transacting(tx)
        ])

      .spread (cardCollection)->

        @.cardCollection = cardCollection
        return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        updateSpirit = (walletData)=>
          walletData ?= {}
          walletData.updated_at = NOW_UTC_MOMENT.valueOf()
          walletData.spirit_amount = @.userRow.wallet_spirit
          return walletData

        return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateSpirit)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("InventoryModule").timeEnd "craftCard() -> user #{userId.blue} ".green+" crafted card #{cardId}".green

      Jobs.create("update-user-achievements",
        name: "Update User Crafting Achievements"
        title: util.format("User %s :: Update Crafting Achievements", userId)
        userId: userId
        craftedCardId: cardId
      ).removeOnComplete(true).save()

      return {
        wallet:
          spirit_amount:@.userRow.wallet_spirit
          gold_amount:@.userRow.wallet_gold
          updated_at:NOW_UTC_MOMENT.valueOf()
        card: @.cardCollection[cardId]
      }


    return txPromise

  ###*
  # Craft a cosmetic for a user.
  # @public
  # @param  {String}  userId    User ID.
  # @param  {Array}    cardId    CardID to craft.
  # @return  {Promise}        Resulting data object containing crafted card and resulting inventory data
  ###
  @craftCosmetic: (userId,cosmeticId) ->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "craftCosmetic() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not craft cosmetic: invalid user ID - #{userId}"))

    # userId must be defined
    unless cosmeticId
      Logger.module("InventoryModule").debug "craftCosmetic() -> user - #{userId.blue} invalid cosmeticId - #{cosmeticId}.".red
      return Promise.reject(new Error("Can not craft cosmetic: user - #{userId.blue} invalid cosmeticId - #{cosmeticId}"))

    NOW_UTC_MOMENT = moment().utc()

    rewards = []

    # make sure card id is an integer
    cosmeticId = parseInt(cosmeticId)

    cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)

    Logger.module("InventoryModule").time "craftCosmetic() -> user #{userId.blue} ".green+" crafted cosmetic #{cosmeticId}".green

    # if there is no collectible cosmetic with the cosmeticId, just abort the whole process
    if not cosmeticData?
      Logger.module("InventoryModule").debug "craftCosmetic() -> ERROR: #{userId} is trying to craft a an unknown cosmetic #{cosmeticId}".red
      return Promise.reject(new Errors.BadRequestError("No collectible cosmetic with ID: #{cosmeticId}."))

    if not cosmeticData.enabled
      Logger.module("InventoryModule").debug "craftCosmetic() -> ERROR: #{userId} is trying to craft a an unknown cosmetic #{cosmeticId}".red
      return Promise.reject(new Errors.BadRequestError("No collectible cosmetic with ID: #{cosmeticId}."))

    # if the card has no rarity
    if not cosmeticData.rarityId?
      Logger.module("InventoryModule").debug "craftCosmetic() -> ERROR: #{userId} is trying to craft a cosmetic without rarity #{cosmeticId}".red
      return Promise.reject(new Errors.BadRequestError("Could not craft cosmetic #{cosmeticId}. It's not yet available."))


    rarityData = SDK.RarityFactory.rarityForIdentifier(cosmeticData.rarityId)
    spiritCost = rarityData.spiritCostCosmetic

    this_obj = {}

    txPromise = knex.transaction (tx)->

      return tx.first('wallet_spirit').from("users").where('id',userId).forUpdate()
      .bind this_obj
      .then (userRow)->
        @.userRow = userRow
        return tx("user_cosmetic_inventory").first().where("user_id",userId).andWhere("cosmetic_id",cosmeticId)
      .then (cosmeticRow) ->
        # Check if user already owns this cosmetic
        if cosmeticRow?
          return Promise.reject(new Errors.AlreadyExistsError("User #{userId} already owns cosmetic #{cosmeticId}"))

        userRow = @.userRow

        if userRow.wallet_spirit < spiritCost
          Logger.module("InventoryModule").debug "craftCosmetic() -> ERROR: user #{userId.blue} ".red+" has insufficient spirit (#{userRow.wallet_spirit}) to craft cosmetic #{cosmeticId}".red
          return Promise.reject(new Errors.InsufficientFundsError("Insufficient resources in wallet to cosmetic #{cosmeticId} - by user #{userId}"))

        userRow.wallet_spirit -= spiritCost

        userCurrencyLogItem =
          id:          generatePushId()
          user_id:      userId
          spirit:        -spiritCost
          memo:        'craft cosmetic'
          created_at:      NOW_UTC_MOMENT.toDate()

        userUpdateParams =
          wallet_spirit: userRow.wallet_spirit
          wallet_updated_at: NOW_UTC_MOMENT.toDate()

        return Promise.all([
          InventoryModule.giveUserCosmeticId(txPromise,tx,userId,cosmeticId,"craft cosmetic",userCurrencyLogItem.id,null,NOW_UTC_MOMENT)
          tx("users").where('id',userId).update(userUpdateParams)
          tx("user_currency_log").insert(userCurrencyLogItem)
        ])

      .then ()->

        return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        updateSpirit = (walletData)=>
          walletData ?= {}
          walletData.updated_at = NOW_UTC_MOMENT.valueOf()
          walletData.spirit_amount = @.userRow.wallet_spirit
          return walletData

        return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateSpirit)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->


      Logger.module("InventoryModule").timeEnd "craftCosmetic() -> user #{userId.blue} ".green+" crafted cosmetic #{cosmeticId}".green

      return {
      wallet:
        spirit_amount:@.userRow.wallet_spirit
        updated_at:NOW_UTC_MOMENT.valueOf()
        cosmetic_id: cosmeticId
      }


    return txPromise

  ###*
  # Credits the user with the passed in card ids (include multiples of ids for multiples of a card)
  # @public
  # @param  {Promise}    trxPromise    Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx        KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID.
  # @param  {Array}        cardIds      Array of card ids to credit user with (can include duplicates)
  # @param  {String}    sourceType    Where is this user receiving cards from (booster,arena-reward,faction-progression,craft)
  # @param  {String}    sourceId    ID of booster pack, arena run, etc that gave this user cards
  # @param  {String}    memo      An optional short description of the card operation
  # @return  {Promise}            Promise that will resolve with the user's card collection cache after the card has been credited
  ###
  @giveUserCards: (trxPromise, trx, userId, cardIds, sourceType, sourceId, memo) ->

    # Logger.module("InventoryModule").time "giveUserCards() -> User #{userId.blue}".green + " received #{util.inspect(cardIds)} cards.".green

    # cardIds is not optional
    if not cardIds?
      Logger.module("InventoryModule").debug "giveUserCards() -> cardIds does not exist. User #{userId.blue}".red
      return Promise.reject(new Errors.BadRequestError("Card Ids does not exist"))

    # if cardIds is empty just resolve
    if cardIds.length == 0
      return Promise.resolve()

    # Can not give a user skinned card ids (they exist in cosmetics)
    for cardId in cardIds
      if SDK.Cards.getIsSkinnedCardId(cardId)
        Logger.module("InventoryModule").debug "giveUserCards() -> attempted to give skinned card id (#{cardId}) to user #{userId.blue}".red
        return Promise.reject(new Errors.BadRequestError("Invalid card data"))

    NOW_UTC_MOMENT = moment.utc()
    cardDataList = _.map(cardIds, (id)->
      return {
        id:generatePushId()
        user_id:userId
        card_id:id
        created_at:NOW_UTC_MOMENT.toDate()
        is_credit:true
        source_type:sourceType
        source_id:sourceId
        memo:memo
      }
    )

    cardDataListReduced = _.reduce(cardDataList,((memo,cardData)->

      memo[cardData.card_id] ?=
        user_id:userId
        card_id:cardData.card_id
        created_at:NOW_UTC_MOMENT.toDate()
        updated_at:NOW_UTC_MOMENT.toDate()
        count:0
        is_unread:true
        is_new:true

      memo[cardData.card_id].count += 1

      return memo
    ),{})

    return Promise.all([
      trx("user_cards").select().whereIn('card_id',cardIds).andWhere({'user_id':userId}).forUpdate(),
      trx.insert(cardDataList).into("user_card_log"),
    ])
    .bind {}
    .spread (cardCountRows)->

      @.cardCountRows = cardCountRows

      allPromises = []

      for cardId,card of cardDataListReduced

        cardRow = _.find(cardCountRows,(row)-> return row.card_id == card.card_id)

        updateCardPromise = null

        if cardRow
          cardRow.count = cardRow.count + card.count
          cardRow.is_unread = true

          updateCardPromise = knex("user_cards").where({'user_id':userId,'card_id':card.card_id}).update(
            count:      cardRow.count
            updated_at:    NOW_UTC_MOMENT.toDate()
            is_unread:    cardRow.is_unread
          )
          .transacting(trx)
        else
          updateCardPromise = knex.insert(card).into("user_cards").transacting(trx)
          cardCountRows.push(card)

        allPromises.push(updateCardPromise)

      return Promise.all(allPromises)

    .then ()->

      return InventoryModule._refreshUserCardCollection(trxPromise,trx,userId,@.cardCountRows)

    .then (cardCollectionRow)->

      # Kick off job to update acheivements
      Jobs.create("update-user-achievements",
        name: "Update User Inventory Achievements"
        title: util.format("User %s :: Update Inventory Achievements", userId)
        userId: userId
        inventoryChanged: true
      ).removeOnComplete(true).save()

      # Logger.module("InventoryModule").timeEnd "giveUserCards() -> User #{userId.blue}".green + " received #{util.inspect(cardIds)} cards.".green

      return cardCollectionRow

  ###*
  # Add an emote pack to a user's inventory for a specified transaction type.
  # @public
  # @param  {Promise}    trxPromise      Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx          KNEX transaction to attach this operation to.
  # @param  {String}    userId        User ID for which to add an emote.
  # @param  {String}    transactionType    'hard', 'xp', or 'event'.
  # @param  {Integer}    emoteId        emote id
  # @param  {Integer}    factionId      emote faction id
  # @return  {Promise}
  ###
  # TODO: Remove this and replace uses with giveUserCosmeticId
  @addEmoteToUser: (trxPromise, trx, userId, transactionType, emoteId, factionId)->
    # all parameters must be defined
    if !userId? or !transactionType? or !emoteId? or !factionId?
      Logger.module("UsersModule").debug "addEmoteToUser() -> invalid request - #{userId}, #{transactionType}, #{emoteId}, #{factionId}.".red
      return Promise.reject(new Error("Can not add emote: invalid request - #{userId}, #{transactionType}, #{emoteId}, #{factionId}."))

    Logger.module("InventoryModule").time "addEmoteToUser() -> user #{userId.blue} ".green+" received emote #{emoteId}".green

    return knex.insert({
      user_id:userId
      emote_id:emoteId
      faction_id:factionId
      transaction_type:transactionType
    }).into("user_emotes").transacting(trx)
    .bind {}
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      @inventory = fbRootRef.child("user-inventory").child(userId)

      emotes = @inventory.child("emotes")
      @.emotes_data = {created_at:moment().utc().valueOf(), transaction_type:transactionType}
      emote_entry = emotes.child(emoteId)

      return FirebasePromises.set(emote_entry,@.emotes_data)
    .then ()->

      Logger.module("InventoryModule").timeEnd "addEmoteToUser() -> user #{userId.blue} ".green+" received emote #{emoteId}".green
      return @.emotes_data

  ###*
  # Syncs user's collection data to the card count rows
  # @private
  # @param  {Promise}    trxPromise    Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx        KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID.
  # @param  {Array}      cardCountRows  Array of rows with at least {card_id:<id>,count:<count>,is_unread:<bool>,is_new:<bool>}.
  # @param  {Boolean}    updateFirebase  Should we also sync firebase data? (default:true)
  # @return  {Promise}            Promise that will resolve with the user's card collection cache
  ###
  @_refreshUserCardCollection: (trxPromise,trx,userId,cardCountRows,updateFirebase=true) ->

    this_obj = {}

    # # when the transaction is done, update Firebase
    # trxPromise
    # .bind this_obj
    # .then ()->
    #   return DuelystFirebase.connect().getRootRef()
    # .then (fbRootRef) ->
    #   cardsData = @.collectionRow?.cards || null
    #   card_collection = fbRootRef.child("user-inventory").child(userId).child("card-collection")
    #   return FirebasePromises.set(card_collection,cardsData)

    NOW_UTC_MOMENT = moment.utc()

    return knex.first().from("user_card_collection").where('user_id',userId).transacting(trx).forUpdate()
    .bind this_obj
    .then (collectionRow)->

      # Logger.module("InventoryModule").debug "_refreshUserCardCollection() -> collectionRow ",collectionRow
      # Logger.module("InventoryModule").debug "_refreshUserCardCollection() -> cardCountRows ",cardCountRows

      needsInsert = false
      if not collectionRow?
        needsInsert = true
        collectionRow =
          user_id:userId
          cards:{}
          created_at:NOW_UTC_MOMENT.toDate()
          is_unread:true

      @.updatedCardsData = {}

      for cardRow in cardCountRows
        if cardRow.count > 0
          collectionRow.cards[cardRow.card_id] ?= {}
          collectionRow.cards[cardRow.card_id].count = cardRow.count
          collectionRow.cards[cardRow.card_id].is_unread = cardRow.is_unread
          collectionRow.cards[cardRow.card_id].is_new = cardRow.is_new
          @.updatedCardsData[cardRow.card_id] = collectionRow.cards[cardRow.card_id]
        else
          delete collectionRow.cards[cardRow.card_id]
          @.updatedCardsData[cardRow.card_id] = null

      @.collectionRow = collectionRow

      if needsInsert
        return knex.insert(collectionRow).into("user_card_collection").transacting(trx)
      else
        return knex("user_card_collection").where('user_id',userId).update(
          cards:collectionRow.cards
          updated_at:NOW_UTC_MOMENT.toDate()
        ).transacting(trx)

    .then ()->
      return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      if updateFirebase
        card_collection = fbRootRef.child("user-inventory").child(userId).child("card-collection")
        return FirebasePromises.update(card_collection,@.updatedCardsData)
      else
        return true
    .then ()->
      return @.collectionRow?.cards

  ###*
  # Mark a card as read in a user's collection and update relevant caches
  # @public
  # @param  {String}    userId      User ID.
  # @param  {Integer}      cardId      Card ID to mark as read
  # @return  {Promise}            Promise that will resolve to the user's inventory after the card has been marked
  ###
  @markCardAsReadInUserCollection: (userId, cardId) ->

    cardId = parseInt(cardId)
    NOW_UTC_MOMENT = moment.utc()

    Logger.module("InventoryModule").time "markCardAsReadInUserCollection() -> user #{userId.blue} ".green+" marking card #{cardId} as READ".green

    return knex("user_cards").where('user_id',userId).andWhere('card_id',cardId).update({
      is_new: false,
      is_unread: false,
    })
    .then ()->
      Logger.module("InventoryModule").timeEnd "markCardAsReadInUserCollection() -> user #{userId.blue} ".green+" marking card #{cardId} as READ".green
    .catch (error)->
      Logger.module("InventoryModule").debug "markCardAsReadInUserCollection() -> ERROR".red, error
      throw error

  ###*
  # Mark all cards as read in a user's collection and update relevant caches
  # @public
  # @param  {String}    userId      User ID.
  # @return  {Promise}            Promise that will resolve to the user's inventory after all cards have been marked
  ###
  @markAllCardsAsReadInUserCollection: (userId) ->

    NOW_UTC_MOMENT = moment.utc()
    cardRowsToUpdate = []

    Logger.module("InventoryModule").time "markAllCardsAsReadInUserCollection() -> user #{userId.blue} ".green+" marking all cards as READ".green

    return knex("user_cards").where('user_id',userId).update({
      is_new:false,
      is_unread:false
    })
    .then ()->
      Logger.module("InventoryModule").timeEnd "markAllCardsAsReadInUserCollection() -> user #{userId.blue} ".green+" marking all cards as READ".green
    .catch (error)->
      Logger.module("InventoryModule").debug "markAllCardsAsReadInUserCollection() -> ERROR".red, error
      throw error

  ###*
  # Mark a card's lore as read in a user's collection and update relevant caches
  # @public
  # @param  {String}    userId      User ID.
  # @param  {Integer}      cardId      Card ID to mark as read
  # @return  {Promise}            Promise that will resolve to the user's inventory after the card has been marked
  ###
  @markCardLoreAsReadInUserCollection: (userId, cardId) ->

    cardId = parseInt(cardId)
    NOW_UTC_MOMENT = moment.utc()

    Logger.module("InventoryModule").time "markCardLoreAsReadInUserCollection() -> user #{userId.blue} ".green+" marking card #{cardId} lore as READ".green

    cardLoreData = null

    txPromise = knex.transaction (tx)->

      knex.select('id').from("users").where({'id':userId}).transacting(tx).forUpdate()
      .bind {}
      .then ()-> return knex.select().from("user_card_lore_inventory").where({'user_id':userId,'card_id':cardId}).transacting(tx).forUpdate()
      .then (cardLoreCountRows)->
        cardLoreData = cardLoreCountRows[0]
        if cardLoreData?
          # update existing
          cardLoreData.is_unread = false
          cardLoreData.updated_at = NOW_UTC_MOMENT.toDate()
          return knex("user_card_lore_inventory").where({'user_id':userId,'card_id':cardId}).update({is_unread: false, updated_at: cardLoreData.updated_at}).transacting(tx)
        else
          # create new entry
          cardLoreData =
            user_id:userId
            card_id: cardId
            created_at: NOW_UTC_MOMENT.toDate()
            updated_at: NOW_UTC_MOMENT.toDate()
            is_unread: false
          return knex.insert(cardLoreData).into("user_card_lore_inventory").transacting(tx)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef)->
      cardLoreDataFB =
        card_id: cardId
        is_unread: false
      FirebasePromises.set(fbRootRef.child("user-inventory").child(userId).child("card-lore").child(cardId), cardLoreDataFB)
    .then ()->
      Logger.module("InventoryModule").timeEnd "markCardLoreAsReadInUserCollection() -> user #{userId.blue} ".green+" marking card #{cardId} lore as READ".green
    .catch (error)->
      Logger.module("InventoryModule").debug "markCardLoreAsReadInUserCollection() -> ERROR".red, error
      throw error

    return txPromise

  ###*
  # Wipe a users card inventory and award them booster orbs equal to the number they've already opened.
  # @public
  # @param  {String}    userId      User ID.
  # @return  {Promise}            Promise.
  ###
  @softWipeUserCardInventory: (userId,systemTime)->

    NOW_UTC_MOMENT = systemTime || moment.utc()

    if not NOW_UTC_MOMENT.isBefore(InventoryModule.SOFTWIPE_AVAILABLE_UNTIL)
      Logger.module("InventoryModule").error "softWipeUserCardInventory() -> soft wipe period expired. u: #{userId.blue}".red
      return Promise.reject(new Errors.BadRequestError("Account soft wipe is not presently available."))

    Logger.module("InventoryModule").time "softWipeUserCardInventory() -> for user #{userId.blue}"

    txPromise = knex.transaction (tx)->
      tx("users").first('id','wallet_spirit','soft_wipe_count').where('id',userId).forUpdate()
      .bind {}
      .then (userRow)->

        @.userRow = userRow
        if userRow.soft_wipe_count >= InventoryModule.MAX_SOFTWIPE_COUNT
          Logger.module("InventoryModule").error "softWipeUserCardInventory() -> max number of soft wipes already reached. u: #{userId.blue}".red
          throw new Errors.BadRequestError("Already at MAX number of soft wipes allowed.")

        return tx("user_card_log").where('user_id',userId)

      .then (cardLogRows)->

        allPromises = []
        cumulativeCardLog = []
        cardCounts = []
        anyWiped = false

        for cardLog in cardLogRows
          cumulativeCardLog.push(cardLog)
          if cardLog["source_type"] == "spirit orb" or cardLog["source_type"] == "craft" or cardLog["source_type"] == "disenchant"
            Logger.module("InventoryModule").debug "softWipeUserCardInventory() -> reversing card #{cardLog.card_id} log type: #{cardLog.source_type} #{userId.blue}"
            anyWiped = true # mark that we have wiped at least one card
            debitRow = _.clone(cardLog)
            debitRow.id = generatePushId()
            debitRow.is_credit = !cardLog.is_credit
            debitRow.source_type = "soft wipe"
            debitRow.source_id = null
            debitRow.created_at = NOW_UTC_MOMENT.toDate()
            allPromises.push tx("user_card_log").insert(debitRow)
            cumulativeCardLog.push(debitRow)

        if not anyWiped
          throw new Errors.BadRequestError("User does not appear to have any cards that need to be wiped.")

        for cardLog in cumulativeCardLog
          cardCountRow = _.find cardCounts, (c)-> c.card_id == cardLog.card_id
          if not cardCountRow?
            cardCountRow = {
              user_id: userId
              count: 0
              card_id: cardLog.card_id
              created_at: NOW_UTC_MOMENT.toDate()
              is_unread: false
              is_new: false
            }
            cardCounts.push(cardCountRow)

          if cardLog.is_credit
            cardCountRow.count += 1
          else
            cardCountRow.count -= 1

        Logger.module("InventoryModule").debug "softWipeUserCardInventory() -> card counts for #{userId.blue}", cardCounts

        @.cardCountRows = cardCounts
        allPromises.push tx("user_cards").delete().where('user_id',userId)

        for cardCountRow in cardCounts
          if cardCountRow.count > 0
            allPromises.push tx("user_cards").insert(cardCountRow)

        return Promise.all(allPromises)
      .then ()->
        return InventoryModule._refreshUserCardCollection(txPromise,tx,userId,@.cardCountRows,true)
      .then ()->
        return tx("user_spirit_orbs_opened").update({
          "wiped_at":NOW_UTC_MOMENT.toDate()
        }).where('user_id',userId)
      .then (wipedCount)->
        allPromises = []
        Logger.module("InventoryModule").debug "softWipeUserCardInventory() -> adding #{wipedCount} orbs to #{userId.blue}"
        for i in [1..wipedCount]
          allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,1,'soft-wipe'))
        return Promise.all(allPromises)
      .then ()->
        if @.userRow.wallet_spirit > 0
          Logger.module("InventoryModule").debug "softWipeUserCardInventory() -> removing #{-@.userRow.wallet_spirit} spirit for #{userId.blue}"
          return InventoryModule.debitSpiritFromUser(txPromise,tx,userId,-@.userRow.wallet_spirit,"soft wipe")
      .then ()->
        tx("users").where('id',userId).update({
          soft_wipe_count: InventoryModule.MAX_SOFTWIPE_COUNT
          last_soft_twipe_at: NOW_UTC_MOMENT.toDate()
        })
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return
    .then ()->
      Logger.module("InventoryModule").timeEnd "softWipeUserCardInventory() -> for user #{userId.blue}"
    .catch (error)->
      Logger.module("InventoryModule").debug "softWipeUserCardInventory() -> ERROR".red, error
      throw error

    return txPromise

  ###*
  # Give user a free card of the day if they have not already claimed it.
  # @public
  # @param  {String}    userId      User ID.
  ###
  @claimFreeCardOfTheDay: (userId,systemTime)->

    NOW_UTC_MOMENT = systemTime || moment.utc()
    this_obj = {}

    randomCardSet = _.sample([
      SDK.CardSet.Core,
      SDK.CardSet.Shimzar,
      SDK.CardSet.FirstWatch,
      SDK.CardSet.CombinedUnlockables,
      SDK.CardSet.Wartech,
      SDK.CardSet.Coreshatter,
    ])
    cardId = _.sample(SDK.GameSession.getCardCaches().getCardSet(randomCardSet).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds())

    Logger.module("InventoryModule").time "claimFreeCardOfTheDay() -> #{userId.blue} claiming #{cardId}"

    txPromise = knex.transaction (tx)->

      return tx("users").first("free_card_of_the_day_claimed_at", "free_card_of_the_day_claimed_count").where('id',userId).forUpdate()
      .bind this_obj
      .then (userRow)->
        startOfToday = NOW_UTC_MOMENT.startOf('day')
        lastClaimedDate = userRow.free_card_of_the_day_claimed_at || 0
        lastClaimedAtDay = moment.utc(lastClaimedDate).startOf('day')

        Logger.module("InventoryModule").debug "claimFreeCardOfTheDay() -> today's day: #{startOfToday.format()} ... last claimed day: #{lastClaimedAtDay.format()}"

        if not lastClaimedAtDay.isBefore(startOfToday)
          throw new Errors.BadRequestError("You've already claimed a free card of the day today.")

        @.cardId = cardId

        return Promise.all([
          InventoryModule.giveUserCards(txPromise, tx, userId, [@.cardId], "FCOTD", null, startOfToday.format("YYYY-MM-DD")),
          tx("users").where('id',userId).update(
            free_card_of_the_day_claimed_count: userRow.free_card_of_the_day_claimed_count + 1
            free_card_of_the_day_claimed_at: NOW_UTC_MOMENT.toDate()
          )
        ])
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        return FirebasePromises.set(fbRootRef.child("users").child(userId).child("free_card_of_the_day_claimed_at"),NOW_UTC_MOMENT.valueOf())
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then ()-> return @.cardId

    .then ()->

      Logger.module("InventoryModule").timeEnd "claimFreeCardOfTheDay() -> #{userId.blue} claiming #{cardId}"
      return cardId

    return txPromise

  ###*
  # Add a gauntlet ticket to a user's inventory for a specified transaction type.
  # @public
  # @param  {Promise}    trxPromise          Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx              KNEX transaction to attach this operation to.
  # @param  {String}    userId            User ID for which to buy a booster pack.
  # @param  {String}    transactionType        'soft','hard','gauntlet', or 'xp'.
  # @param  {String}    transactionId        the identifier for the transaction that caused this ticket to be added.
  # @return  {Promise}    Promise that will post TICKET ID on completion.
  ###
  @addArenaTicketToUser: (trxPromise, trx, userId, transactionType, transactionId=null)->

    # userId must be defined
    unless userId
      Logger.module("InventoryModule").debug "addArenaTicketToUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not add gauntlet ticket : invalid user ID - #{userId}"))

    # userId must be defined
    unless trx
      Logger.module("InventoryModule").debug "addArenaTicketToUser() -> invalid trx - #{trx}.".red
      return Promise.reject(new Error("Can not add booster pack : invalid transaction parameter"))

    ticketId = generatePushId()

    NOW_UTC_MOMENT = moment.utc()

    # # when the transaction is done, update Firebase
    # trxPromise.then ()->
    #   return DuelystFirebase.connect().getRootRef()
    # .then (fbRootRef) ->
    #   tickets = fbRootRef.child("user-inventory").child(userId).child("gauntlet-tickets")
    #   data =
    #     created_at:NOW_UTC_MOMENT.valueOf()
    #     transaction_type:transactionType
    #   return FirebasePromises.set(tickets.child(ticketId),data)
    # .then ()->
    #   return Promise.resolve(ticketId)

    # return the insert statement and attach it to the transaction
    return knex.insert(
      id:          ticketId
      user_id:      userId
      transaction_type:  transactionType
      transaction_id:    transactionId
      created_at:      NOW_UTC_MOMENT.toDate()
    )
    .into("user_gauntlet_tickets")
    .transacting(trx)
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      tickets = fbRootRef.child("user-inventory").child(userId).child("gauntlet-tickets")
      data =
        created_at:NOW_UTC_MOMENT.valueOf()
        transaction_type:transactionType
      return FirebasePromises.set(tickets.child(ticketId),data)
    .then ()->
      Logger.module("GauntletModule").debug "addArenaTicketToUser() -> added #{ticketId} to user #{userId.blue}.".green
      return Promise.resolve(ticketId)


module.exports = InventoryModule
