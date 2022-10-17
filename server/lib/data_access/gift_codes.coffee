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
CosmeticChestsModule = require './cosmetic_chests'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'

SDK = require '../../../app/sdk'

class GiftCodesModule

  @redeemGiftCode:(userId,giftCode,systemTime)->

    MOMENT_NOW_UTC = systemTime || moment().utc()

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not claim gift code: invalid user ID - #{userId}"))

    # userId must be defined
    if !giftCode
      return Promise.reject(new Error("Can not claim gift code: invalid code - #{giftCode}"))

    this_obj = {}

    txPromise = knex.transaction (tx)->

      Promise.all([
        tx('users').first('id','created_at').where('id',userId).forUpdate(),
        tx('gift_codes').first().where('code',giftCode).forUpdate(),
        tx('user_progression').first('game_count').where('user_id',userId),
      ])
      .bind this_obj
      .spread (userRow, giftCodeRow, progressionRow)->

        @.giftCodeRow = giftCodeRow
        @.userRow = userRow
        @.progressionRow = progressionRow

        if not userRow?
          throw new Errors.NotFoundError("User Not Found")

        if not giftCodeRow?
          throw new Errors.NotFoundError("Gift Code Note Found")

        if giftCodeRow.claimed_at?
          throw new Errors.BadRequestError("This Gift Code has already been claimed.")

        if giftCodeRow.valid_for_users_created_after? and moment.utc(userRow.created_at).isBefore(moment.utc(giftCodeRow.valid_for_users_created_after))
          throw new Errors.BadRequestError("This Gift Code can not be claimed by this account.")

        if giftCodeRow.expires_at? and moment.utc().isAfter(moment.utc( giftCodeRow.expires_at))
          throw new Errors.BadRequestError("This Gift Code has expired.")

        if giftCodeRow.game_count_limit? and progressionRow.game_count > giftCodeRow.game_count_limit
          throw new Errors.BadRequestError("This Gift Code can not be applied to an accont with #{progressionRow.game_count} games played.")

        exclusionCheckPromise = Promise.resolve(null)
        if (@.giftCodeRow.exclusion_id?)
          exclusionCheckPromise = tx('gift_codes').first().where('claimed_by_user_id',userId).andWhere('exclusion_id',@.giftCodeRow.exclusion_id)

        return exclusionCheckPromise
      .then (claimedGiftCodeWithMatchingExclusionRow) ->
        if claimedGiftCodeWithMatchingExclusionRow?
          throw new Errors.BadRequestError("Gift Code of this type has already been claimed.")

        allPromises = []

        # Kickstarter Backers $50 or below
        # 1 of every core set collectible non-prismatic card from every faction except magmar and vanar
        if @.giftCodeRow.type == 'ks-1'
          card_ids = _.chain(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards())
            .filter (c)-> return c.getFactionId() != SDK.Factions.Vanar and c.getFactionId() != SDK.Factions.Magmar
            .map (c)-> return c.getId()
            .value()
          allPromises.push InventoryModule.giveUserCards(txPromise, tx, userId, card_ids, "gift code reward", @.giftCodeRow.code)

        # Kickstarter Backers $60 or above
        # 1 of every core set collectible non-prismatic card
        if @.giftCodeRow.type == 'ks-2'
          card_ids = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCardIds()
          allPromises.push InventoryModule.giveUserCards(txPromise, tx, userId, card_ids, "gift code reward", @.giftCodeRow.code)

        # Currency Reward Code
        if @.giftCodeRow.type == 'rewards' || @.giftCodeRow.type == 'humble'
          goldAmount = @.giftCodeRow.rewards?.gold
          spiritAmount = @.giftCodeRow.rewards?.spirit
          spiritOrbs = @.giftCodeRow.rewards?.orbs
          shimzarSpiritOrbs = @.giftCodeRow.rewards?.shimzar_orbs
          comboSpiritOrbs = @.giftCodeRow.rewards?.combo_orbs
          unearthedSpiritOrbs = @.giftCodeRow.rewards?.unearthed_orbs
          immortalSpiritOrbs = @.giftCodeRow.rewards?.immortal_orbs
          mythronSpiritOrbs = @.giftCodeRow.rewards?.mythron_orbs
          gauntletTickets = @.giftCodeRow.rewards?.gauntlet_tickets
          cosmetics = @.giftCodeRow.rewards?.cosmetics
          cardIds = @.giftCodeRow.rewards?.card_ids
          crate_keys = @.giftCodeRow.rewards?.crate_keys
          crates = @.giftCodeRow.rewards?.crates

          if goldAmount
            allPromises.push InventoryModule.giveUserGold(txPromise, tx, userId, goldAmount, "gift code", @.giftCodeRow.code)

          if spiritAmount
            allPromises.push InventoryModule.giveUserSpirit(txPromise, tx, userId, spiritAmount, "gift code", @.giftCodeRow.code)

          if spiritOrbs
            for i in [0...spiritOrbs]
              allPromises.push InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Core, "gift code", @.giftCodeRow.code)

          if shimzarSpiritOrbs
            for i in [0...shimzarSpiritOrbs]
              allPromises.push InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Shimzar, "gift code", @.giftCodeRow.code)

          if comboSpiritOrbs
            for i in [0...comboSpiritOrbs]
              allPromises.push InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.CombinedUnlockables, "gift code", @.giftCodeRow.code)

          if unearthedSpiritOrbs
            for i in [0...unearthedSpiritOrbs]
              allPromises.push InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.FirstWatch, "gift code", @.giftCodeRow.code)

          if immortalSpiritOrbs
            for i in [0...immortalSpiritOrbs]
              allPromises.push InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Wartech, "gift code", @.giftCodeRow.code)

          if mythronSpiritOrbs
            for i in [0...mythronSpiritOrbs]
              allPromises.push InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Coreshatter, "gift code", @.giftCodeRow.code)

          if gauntletTickets
            for i in [0...gauntletTickets]
              allPromises.push InventoryModule.addArenaTicketToUser(txPromise, tx, userId, "gift code", @.giftCodeRow.code)

          if cosmetics
            for cosmetic in cosmetics
              allPromises.push InventoryModule.giveUserCosmeticId(txPromise, tx, userId, cosmetic, "gift code", @.giftCodeRow.code)

          if cardIds?
            allPromises.push InventoryModule.giveUserCards(txPromise,tx,userId,cardIds,"gift code",@.giftCodeRow.code)

          if crates?
            for crateType in crates
              allPromises.push CosmeticChestsModule.giveUserChest(txPromise,tx,userId,crateType,null,null,1,"gift code",@.giftCodeRow.code)

          if crate_keys?
            for keyType in crate_keys
              allPromises.push CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,keyType,1,"gift code",@.giftCodeRow.code)

        allPromises.push tx('gift_codes').where('code',giftCode).update(
          claimed_by_user_id: @.userRow.id
          claimed_at: MOMENT_NOW_UTC.toDate()
        )

        return Promise.all(allPromises)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->
      Logger.module("GiftCodesModule").debug "redeemGiftCode() -> user #{userId.blue} ".green + " reedemed code #{giftCode}".green
      return Promise.resolve(@.giftCodeRow)

module.exports = GiftCodesModule
