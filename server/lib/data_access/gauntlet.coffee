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
GamesModule = require './games'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'

# SDK imports
SDK = require '../../../app/sdk'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'

class GauntletModule

  ###*
  # GOLD cost for a GAUNTLET Ticket.
  # @public
  ###
  @GAUNTLET_TICKET_GOLD_PRICE: 0 # was 150

  ###*
  # Maximum win count for gauntlet.
  # @public
  ###
  @GAUNTLET_MAX_WINS: 12

  ###*
  # Orb sets that can be part of the Gauntlet rewards
  # Equal chance for any of these orbs to be chosen
  # @private
  ###
  @_GAUNTLET_SPIRIT_ORB_REWARD_SETS: [SDK.CardSet.Core, SDK.CardSet.Shimzar, SDK.CardSet.FirstWatch, SDK.CardSet.Wartech, SDK.CardSet.CombinedUnlockables, SDK.CardSet.Coreshatter]

  ###*
  # Use soft currency (gold) to buy an arena ticket for a user.
  # @public
  # @param  {String}  userId    User ID for which to buy an arena ticket.
  # @return  {Promise}        Promise that will post ARENA TICKET ID on completion.
  ###
  @buyArenaTicketWithGold: (userId) ->

    # userId must be defined
    unless userId
      Logger.module("GauntletModule").debug "buyArenaTicketWithGold() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not buy arena ticket with gold : invalid user ID - #{userId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}
    txPromise = knex.transaction (tx)->

      knex.first()
        .from('users')
        .where('id',userId)
        .transacting(tx)
        .forUpdate()
      .bind this_obj
      .then (userRow)->

        # if the user has enough gold
        if userRow.wallet_gold >= GauntletModule.GAUNTLET_TICKET_GOLD_PRICE

          # calculate final gold
          final_wallet_gold = @.final_wallet_gold = userRow.wallet_gold - GauntletModule.GAUNTLET_TICKET_GOLD_PRICE

          # setup what to update the user params with
          userUpdateParams =
            wallet_gold:    final_wallet_gold
            wallet_updated_at:   NOW_UTC_MOMENT.toDate()

          return knex("users").where('id',userId).update(userUpdateParams).transacting(tx)

        else

          Logger.module("GauntletModule").debug "buyArenaTicketWithGold() -> Cannot buy ticket because user #{userId.blue} has insufficient funds".red
          return Promise.reject(new Errors.InsufficientFundsError("Insufficient funds in wallet to buy gauntlet ticket for #{userId}"))

      .then ()->
        return InventoryModule.addArenaTicketToUser(txPromise, tx,userId, "soft")
      .then (ticketId)->
        @.ticketId = ticketId
        userCurrencyLogItem =
          id:          generatePushId()
          user_id:      userId
          gold:        -GauntletModule.GAUNTLET_TICKET_GOLD_PRICE
          memo:        "gauntlet ticket #{ticketId}"
          created_at:      NOW_UTC_MOMENT.toDate()
        return knex.insert().into("user_currency_log").transacting(tx)

      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        updateWalletData = (walletData)=>
          walletData ?= {}
          walletData.gold_amount = @.final_wallet_gold
          walletData.updated_at = NOW_UTC_MOMENT.valueOf()
          return walletData

        return FirebasePromises.safeTransaction(fbRootRef.child("user-inventory").child(userId).child("wallet"),updateWalletData)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("GauntletModule").debug "buyArenaTicketWithGold() -> User #{userId.blue}".green + " purchased ticket #{@.ticketId}.".green

      return Promise.resolve(@.ticketId)

    # return the transaction promise
    return txPromise


#  ###*
#  # Add a gauntlet ticket to a user's inventory for a specified transaction type.
#  # @public
#  # @param  {Promise}    trxPromise          Transaction promise that resolves if transaction succeeds.
#  # @param  {Transaction}  trx              KNEX transaction to attach this operation to.
#  # @param  {String}    userId            User ID for which to buy a booster pack.
#  # @param  {String}    transactionType        'soft','hard','gauntlet', or 'xp'.
#  # @param  {String}    transactionId        the identifier for the transaction that caused this ticket to be added.
#  # @return  {Promise}    Promise that will post TICKET ID on completion.
#  ###
#  @addArenaTicketToUser: (trxPromise, trx, userId, transactionType, transactionId=null)->
#
#    # userId must be defined
#    unless userId
#      Logger.module("GauntletModule").debug "addArenaTicketToUser() -> invalid user ID - #{userId}.".red
#      return Promise.reject(new Error("Can not add gauntlet ticket : invalid user ID - #{userId}"))
#
#    # userId must be defined
#    unless trx
#      Logger.module("GauntletModule").debug "addBoosterPackToUser() -> invalid trx - #{trx}.".red
#      return Promise.reject(new Error("Can not add booster pack : invalid transaction parameter"))
#
#    ticketId = generatePushId()
#
#    NOW_UTC_MOMENT = moment.utc()
#
#    # # when the transaction is done, update Firebase
#    # trxPromise.then ()->
#    #   return DuelystFirebase.connect().getRootRef()
#    # .then (fbRootRef) ->
#    #   tickets = fbRootRef.child("user-inventory").child(userId).child("gauntlet-tickets")
#    #   data =
#    #     created_at:NOW_UTC_MOMENT.valueOf()
#    #     transaction_type:transactionType
#    #   return FirebasePromises.set(tickets.child(ticketId),data)
#    # .then ()->
#    #   return Promise.resolve(ticketId)
#
#    # return the insert statement and attach it to the transaction
#    return knex.insert(
#        id:          ticketId
#        user_id:      userId
#        transaction_type:  transactionType
#        transaction_id:    transactionId
#        created_at:      NOW_UTC_MOMENT.toDate()
#      )
#      .into("user_gauntlet_tickets")
#      .transacting(trx)
#    .then ()-> return DuelystFirebase.connect().getRootRef()
#    .then (fbRootRef) ->
#      tickets = fbRootRef.child("user-inventory").child(userId).child("gauntlet-tickets")
#      data =
#        created_at:NOW_UTC_MOMENT.valueOf()
#        transaction_type:transactionType
#      return FirebasePromises.set(tickets.child(ticketId),data)
#    .then ()->
#      Logger.module("GauntletModule").debug "addArenaTicketToUser() -> added #{ticketId} to user #{userId.blue}.".green
#      return Promise.resolve(ticketId)


  ###*
  # Start an arena run for a user.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  ticketId  Arena ticket ID to use
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @startRun: (userId,ticketId, systemTime) ->

    # userId must be defined
    if !userId
      Logger.module("GauntletModule").debug "startRun() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # ticketId must be defined
    if !ticketId
      Logger.module("GauntletModule").debug "startRun() -> ERROR: invalid ticket ID: #{ticketId}".red
      return Promise.reject(new Error("invalid ticket ID: #{ticketId}"))

    NOW_UTC_MOMENT = systemTime || moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      Promise.all([
        knex("user_gauntlet_run").first().where('user_id',userId).forUpdate().transacting(tx)
        knex("user_gauntlet_tickets").first().where('id',ticketId).forUpdate().transacting(tx)
      ])
      .bind this_obj
      .spread (existingRun,ticketRow)->

        if existingRun?
          if not existingRun.ended_at
            return Promise.reject(new Errors.InvalidRequestError("Could not start run: user already has an active run."))
          if not existingRun.rewards_claimed_at
            return Promise.reject(new Errors.InvalidRequestError("Could not start run: rewards not yet claimed."))

        if ticketRow and ticketRow?.user_id == userId

          ticketRow.used_at = NOW_UTC_MOMENT.toDate()

#          # generate faction choices
#          factionChoices = _.sample([
#            SDK.Factions.Faction1,
#            SDK.Factions.Faction2,
#            SDK.Factions.Faction3,
#            SDK.Factions.Faction4,
#            SDK.Factions.Faction5,
#            SDK.Factions.Faction6
#          ],3)

          @.runData =
            user_id: userId
            ticket_id: ticketId
#            faction_choices: factionChoices
            faction_choices: null
            created_at: NOW_UTC_MOMENT.toDate()
            win_count: 0
            loss_count: 0
            deck:[]

          delete ticketRow.is_unread

          allPromises = [
            knex("user_gauntlet_tickets").delete().where('id',ticketId).transacting(tx),
            knex("user_gauntlet_tickets_used").insert(ticketRow).transacting(tx)
          ]

          if existingRun?
            existingRun.id = existingRun.ticket_id
            delete existingRun.ticket_id
            allPromises.push(knex("user_gauntlet_run").where('user_id',userId).delete().transacting(tx))
            allPromises.push(knex("user_gauntlet_run_complete").insert(existingRun).transacting(tx))



          return Promise.all(allPromises)

        else
          return Promise.reject(new Errors.NotFoundError("Could not start run: gauntlet ticket not found."))
      .then ()->
        return GauntletModule._generateGeneralChoices(txPromise, tx, userId, @.runData.faction_id)
      .then (generalChoiceIds)->
        @.runData.general_choices = generalChoiceIds

        return knex("user_gauntlet_run").insert(@.runData).transacting(tx)


      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        if @.runData.started_at then @.runData.started_at = moment.utc(@.runData.started_at).valueOf()
        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()
        if @.runData.ended_at then @.runData.ended_at = moment.utc(@.runData.ended_at).valueOf()
        if @.runData.created_at then @.runData.created_at = moment.utc(@.runData.created_at).valueOf()
        if @.runData.completed_at then @.runData.completed_at = moment.utc(@.runData.completed_at).valueOf()

        FirebasePromises.remove(fbRootRef.child("user-inventory").child(userId).child("gauntlet-tickets").child(ticketId))
        FirebasePromises.set(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),@.runData)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("GauntletModule").debug "startRun() -> User #{userId.blue}".green + " started run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise


  ###*
  # Resign an arena run for a user.
  # @public
  # @param  {String}  userId    User ID
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @resignRun: (userId) ->

    # userId must be defined
    if !userId
      Logger.module("GauntletModule").debug "resignRun() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))


    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    return knex.transaction (tx)->

      knex("user_gauntlet_run").first().where('user_id',userId).forUpdate().transacting(tx)
      .bind this_obj
      .then (existingRun)->

        if existingRun?

          if existingRun.ended_at
            return Promise.reject(new Errors.InvalidRequestError("Can not resign a finished gauntlet run."))

          @.runData = existingRun
          @.runData.ended_at = NOW_UTC_MOMENT.toDate()
          @.runData.is_resigned = true

          return knex("user_gauntlet_run").where('user_id',userId).update(
            ended_at: @.runData.ended_at
            is_resigned: @.runData.is_resigned
          ).transacting(tx)

        else
          return Promise.reject(new Errors.NotFoundError("No active gautnlet run found."))

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      return DuelystFirebase.connect().getRootRef()

    .then (fbRootRef) ->

      if @.runData.started_at then @.runData.started_at = moment.utc(@.runData.started_at).valueOf()
      if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()
      if @.runData.ended_at then @.runData.ended_at = moment.utc(@.runData.ended_at).valueOf()
      if @.runData.created_at then @.runData.created_at = moment.utc(@.runData.created_at).valueOf()
      if @.runData.completed_at then @.runData.completed_at = moment.utc(@.runData.completed_at).valueOf()

      FirebasePromises.set(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),@.runData)

    .then ()->

      Logger.module("GauntletModule").debug "resignRun() -> User #{userId.blue}".green + " resigned run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)


  ###*
  # Update a user's current arena run based on the outcome of a game
  # @public
  # @param  {String}  userId      User ID for which to update.
  # @param  {Boolean}  isWinner    Did the user win the game?
  # @param  {String}  gameId      Game unique ID
  # @param  {Boolean}  isDraw      Are we updating for a draw?
  # @return  {Promise}          Promise that will notify when complete.
  ###
  @updateArenaRunWithGameOutcome: (userId,isWinner,gameId,isDraw) ->

    # userId must be defined
    if !userId
      Logger.module("GauntletModule").debug "updateArenaRunWithGameOutcome() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # factionId must be defined
    if !gameId
      Logger.module("GauntletModule").debug "updateArenaRunWithGameOutcome() -> ERROR: invalid game ID: #{gameId}".red
      return Promise.reject(new Error("invalid gameId ID: #{gameId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    return knex.transaction (tx)->

      return Promise.resolve(tx("users").first('top_gauntlet_win_count').where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx("user_gauntlet_run").first().where('user_id',userId).forUpdate()
        ])
      .spread (userRow,existingRun)->

        if existingRun?

          allPromises = []

          if existingRun.ended_at
            return Promise.reject(new Error("Can not update progress for a finished gauntlet run."))

          if not existingRun.is_complete
            return Promise.reject(new Error("Can not update progress for a gauntlet run still drafting."))

          if not existingRun.started_at
            existingRun.started_at = NOW_UTC_MOMENT.toDate()

          @.runData = existingRun
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()
          @.runData.games ?= []

          if isDraw
            @.runData.draw_count += 1
          else if isWinner
            @.runData.win_count += 1
          else
            @.runData.loss_count += 1

          @.runData.games.push(gameId)

          # end arena run at 3 losses
          if @.runData.loss_count == 3
            @.runData.ended_at = NOW_UTC_MOMENT.toDate()

          # or end arena run at 9 wins
          if @.runData.win_count == GauntletModule.GAUNTLET_MAX_WINS
            @.runData.ended_at = NOW_UTC_MOMENT.toDate()

          # if this is the user's top ever run, update the user record
          if @.runData.win_count > userRow.top_gauntlet_win_count
            allPromises.push knex("users").where('id',userId).update({
              top_gauntlet_win_count: @.runData.win_count
            }).transacting(tx)

          allPromises.push knex("user_gauntlet_run").where('user_id',userId).update(
            loss_count: @.runData.loss_count
            win_count: @.runData.win_count
            draw_count: @.runData.draw_count
            games: @.runData.games
            updated_at: @.runData.updated_at
            ended_at: @.runData.ended_at
          ).transacting(tx)

          return Promise.all(allPromises)

        else
          return Promise.reject(new Errors.NotFoundError("No active gauntlet run found."))
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->

        @.fbRootRef = fbRootRef

        allPromises = []

        if @.runData.started_at then @.runData.started_at = moment.utc(@.runData.started_at).valueOf()
        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()
        if @.runData.ended_at then @.runData.ended_at = moment.utc(@.runData.ended_at).valueOf()
        if @.runData.created_at then @.runData.created_at = moment.utc(@.runData.created_at).valueOf()

        allPromises.push FirebasePromises.update(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),{
          loss_count: @.runData.loss_count
          win_count: @.runData.win_count
          draw_count: @.runData.draw_count
          ended_at: @.runData.ended_at
        })
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("GauntletModule").error "updateArenaRunWithGameOutcome() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    .then ()-> return Promise.resolve(@.runData)
    .finally ()-> return GamesModule.markClientGameJobStatusAsComplete(userId,gameId,'gauntlet')


  ###*
  # Generate and add rewards for the arena run to a user's inventory
  # @public
  # @param  {String}  userId      User ID for which to claim rewards.
  # @return  {Promise}          Promise that will notify when complete.
  ###
  @claimRewards: (userId)->

    # userId must be defined
    if !userId
      Logger.module("GauntletModule").debug "claimRewards() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.resolve(tx("users").first("id").where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow
          tx("user_gauntlet_run").first().where('user_id',userId).forUpdate()
        ])
      .spread (userRow,existingRun)->

        if existingRun?

          if not existingRun.ended_at
            return Promise.reject(new Errors.InvalidRequestError("Can not claim rewards for an unfinished gauntlet run."))

          if existingRun.rewards_claimed_at
            return Promise.reject(new Errors.ArenaRewardsAlreadyClaimedError("Rewards already claimed for this gauntlet run."))

          @.runData = existingRun
          @.runData.rewards_claimed_at = NOW_UTC_MOMENT.toDate()

          # rewards
          @.runData.rewards = []
          @.runData.reward_ids = []
          rewards = []
          rewardsData = []
          @.rewardsRows = []
          rewardCardIds = []
          rewardMap = GauntletModule._getRewardMap()

          # At 1 win, get a random spirit orb and a  basic box
          if @.runData.win_count >= 1
            rewardsData.push(spirit_orbs: GauntletModule._GAUNTLET_SPIRIT_ORB_REWARD_SETS[Math.floor(Math.random()*GauntletModule._GAUNTLET_SPIRIT_ORB_REWARD_SETS.length)])
            rewards.push(_.sample(rewardMap.basic_box_wins[@.runData.win_count],1)[0])

          # At 2 wins, get a gold box
          if @.runData.win_count >= 2
            rewards.push(_.sample(rewardMap.gold_box_wins[@.runData.win_count],1)[0])

          # At 3 wins, get a good box
          if @.runData.win_count >= 3
            rewards.push(_.sample(rewardMap.good_box_wins[@.runData.win_count],1)[0])

          # Free gauntlet ticket after 6 wins (disabled; gauntlet is already free)
          #if @.runData.win_count > 6
          #  rewardsData.push({arena_tickets:1})

          # At 10 wins, get a great box
          if @.runData.win_count >= 10
            rewards.push(_.sample(rewardMap.great_box_wins[@.runData.win_count],1)[0])

          # At 12 wins, get an awesome box and a gift crate
          if @.runData.win_count >= 12
            rewards.push(_.sample(rewardMap.awesome_box_wins[@.runData.win_count],1)[0])
            keyRandom = Math.random()
            if (keyRandom < 0.85)
              rewardsData.push({cosmetic_keys:[SDK.CosmeticsChestTypeLookup.Common]})
            else if (keyRandom < 0.95)
              rewardsData.push({cosmetic_keys:[SDK.CosmeticsChestTypeLookup.Rare]})
            else
              rewardsData.push({cosmetic_keys:[SDK.CosmeticsChestTypeLookup.Epic]})

          # set arena rewards in db
          for reward in rewards
            if reward instanceof String || typeof reward is "string"
              parts = reward.split(' ')
              if parts[1] == "G"
                rewardsData.push({ gold: parseInt(parts[0]) })
              else if parts[1] == "S"
                rewardsData.push({ spirit: parseInt(parts[0]) })
              else if parts[1] == "ORB"
                rewardsData.push({ spirit_orbs: parseInt(parts[0]) })

            else if reward instanceof Number || typeof reward is "number"
              rarityId = reward

              # get all cards that match rarity reward
              cardsToSampleFrom = []
              for factionData in SDK.FactionFactory.getAllEnabledFactions()
                cardsForFaction = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(factionData.id).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards()
                cardsForFaction = cardsForFaction.concat(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getFaction(factionData.id).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards())
                cardsForFaction = cardsForFaction.concat(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.FirstWatch).getFaction(factionData.id).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards())
                cardsForFaction = cardsForFaction.concat(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Wartech).getFaction(factionData.id).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards())
                cardsForFaction = cardsForFaction.concat(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.CombinedUnlockables).getFaction(factionData.id).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards())
                cardsForFaction = cardsForFaction.concat(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Coreshatter).getFaction(factionData.id).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards())
                cardsToSampleFrom = cardsToSampleFrom.concat(cardsForFaction)

              # get a random card
              card = cardsToSampleFrom[Math.floor(Math.random() * cardsToSampleFrom.length)]
              cardId = card.getId()

              # small chance to reward a prismatic
              if card.getRarityId() == SDK.Rarity.Legendary
                prismaticChance = 0.08
              else if card.getRarityId() == SDK.Rarity.Epic
                prismaticChance = 0.07
              else if card.getRarityId() == SDK.Rarity.Rare
                prismaticChance = 0.06
              else if card.getRarityId() == SDK.Rarity.Common
                prismaticChance = 0.04
              else
                prismaticChance = 0.0
              if Math.random() < prismaticChance
                cardId = SDK.Cards.getPrismaticCardId(cardId)

              # push a reward to rewards data for processing
              # NOTE: this is sort of ignored below for now, see the continue statement in the loop right below.
              # NOTE: the rewardCardIds array is actually used to process cards, see next statement below
              rewardsData.push({ card_id: cardId })
              # add the card to the rewardCardIds array, which is currently used to add cards rewards
              # this is sort of bad and could use a refactor
              rewardCardIds.push(cardId)

          # for use later to set firebase data
          @.runData.rewards = rewardsData

          allPromises = []
          for reward in rewardsData

            # card data is done separately
            if reward.card_id
              continue

            rewardInsertData =
              id:          generatePushId()
              user_id:      userId
              reward_category:  "gauntlet"
              source_id:      @.runData.ticket_id
              created_at:      NOW_UTC_MOMENT.toDate()
              is_unread:      true

            if reward.gold
              rewardInsertData.gold = reward.gold
              allPromises.push(InventoryModule.giveUserGold(txPromise,tx,userId,reward.gold,"gauntlet",@.runData.ticket_id))

            if reward.spirit
              rewardInsertData.spirit = reward.spirit
              allPromises.push(InventoryModule.giveUserSpirit(txPromise,tx,userId,reward.spirit,"gauntlet",@.runData.ticket_id))

            if reward.arena_tickets
              rewardInsertData.gauntlet_tickets = reward.arena_tickets
              allPromises.push(InventoryModule.addArenaTicketToUser(txPromise,tx,userId,"gauntlet",@.runData.ticket_id))

            if reward.cosmetic_keys
              rewardInsertData.cosmetic_keys = reward.cosmetic_keys
              for key in reward.cosmetic_keys
                allPromises.push(CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,key,1,"gauntlet",@.runData.ticket_id,NOW_UTC_MOMENT))

            if reward.spirit_orbs?
              rewardInsertData.spirit_orbs = reward.spirit_orbs
              if _.isArray(reward.spirit_orbs)
                for orbCardSet in reward.spirit_orbs
                  allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,orbCardSet,"gauntlet",@.runData.ticket_id))
              else if _.isNumber(reward.spirit_orbs)
                allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,reward.spirit_orbs,"gauntlet",@.runData.ticket_id))
              else
                return Promise.reject(new Error("invalid spirit orb reward data (#{reward.spirit_orbs}) for user ID: #{userId}"))

            allPromises.push(
              knex("user_rewards").insert(rewardInsertData).transacting(tx)
            )

            @.rewardsRows.push rewardInsertData
            @.runData.reward_ids.push(rewardInsertData.id)

          # add all cards
          if rewardCardIds
            rewardInsertData =
              id:          generatePushId()
              user_id:      userId
              reward_category:  "gauntlet"
              source_id:      @.runData.ticket_id
              created_at:      NOW_UTC_MOMENT.toDate()
              cards:        rewardCardIds
              is_unread:      true
            allPromises.push(InventoryModule.giveUserCards(txPromise,tx,userId,rewardCardIds,"gauntlet",@.runData.ticket_id))
            allPromises.push(
              knex("user_rewards").insert(rewardInsertData).transacting(tx)
            )

            @.rewardsRows.push rewardInsertData
            @.runData.reward_ids.push(rewardInsertData.id)

          # update gauntlet run with reward ids
          allPromises.push(
            knex("user_gauntlet_run").where('user_id',userId).update(
              reward_ids: @.runData.reward_ids
              rewards_claimed_at: @.runData.rewards_claimed_at
            ).transacting(tx)
          )

          return Promise.all(allPromises)

        else
          return Promise.reject(new Errors.NotFoundError("No active gauntlet run found."))

      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        allPromises = []

        if @.runData.rewards_claimed_at then @.runData.rewards_claimed_at = moment.utc(@.runData.rewards_claimed_at).valueOf()
        if @.runData.started_at then @.runData.started_at = moment.utc(@.runData.started_at).valueOf()
        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()
        if @.runData.ended_at then @.runData.ended_at = moment.utc(@.runData.ended_at).valueOf()
        if @.runData.created_at then @.runData.created_at = moment.utc(@.runData.created_at).valueOf()
        if @.runData.completed_at then @.runData.completed_at = moment.utc(@.runData.completed_at).valueOf()

        allPromises.push FirebasePromises.update(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),{
          rewards_claimed_at: @.runData.rewards_claimed_at,
          rewards: @.runData.rewards
          reward_ids: @.runData.reward_ids
        })

        # for rewardRow in @.rewardsRows
        #   reward_id = rewardRow.id
        #   delete rewardRow.id
        #   delete rewardRow.user_id
        #   rewardRow.created_at = moment.utc(rewardRow.created_at).valueOf()
        #   allPromises.push FirebasePromises.set(fbRootRef.child("user-rewards").child(userId).child(reward_id),rewardRow)

        return Promise.all(allPromises)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->
      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Get the arena deck for a user.
  # @public
  # @param  {String}  userId    User ID
  # @return  {Promise}        Promise that will return the arena deck on completion or error out with a NoArenaDeckError.
  ###
  @getArenaDeck: (userId) ->

    # userId must be defined
    if !userId?
      Logger.module("GauntletModule").debug "getArenaDeck() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    return knex("user_gauntlet_run").first().where('user_id',userId)
    .then (run)->
      if run and run.is_complete and run.deck?.length > 0
        # copy deck
        deck = run.deck.slice(0)

        # Legacy gauntlet runs would be broken after this change: https://github.com/88dots/cleancoco/pull/8372
        # If we don't detect decks that do not have a general card in slot 0, so check for a general card and add
        # the default general if one does not exist
        deckGeneralCardId = deck[0]
        deckGeneralSDKCard = SDK.CardFactory.cardForIdentifier(deckGeneralCardId,SDK.GameSession.current())
        if (not deckGeneralSDKCard.isGeneral)
          # Card in slot 0 was not a general, unshift the default general
          factionId = run.faction_id
          faction = SDK.FactionFactory.factionForIdentifier(factionId)
          defaultGeneralId = faction.generalIdsByOrder[SDK.FactionFactory.GeneralOrder.Primary]
          deck.unshift(defaultGeneralId)

        return Promise.resolve(deck)
      else
        return Promise.reject(new Errors.NoArenaDeckError("Could not load user #{userId} arena deck."))

  ###*
  # Get a matchmaking metric for the user's arena run. (12-0) Where, 12 is worst, and 0 is best.
  # @public
  # @param  {String}  userId    User ID
  # @return  {Promise}        Promise that will resolve the integer metric (12-0) on completion.
  ###
  @getRunMatchmakingMetric: (userId) ->

    # userId must be defined
    if !userId
      Logger.module("GauntletModule").debug "getRunMatchmakingMetric() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    return knex("user_gauntlet_run").first().where('user_id',userId)
    .then (run)->
      if not run? or run?.rewards_claimed_at
        throw new Errors.NotFoundError("Gauntlet Run Not Found")
      else if run.is_complete and run.deck?.length > 0
        # grab win count
        winCount = run.win_count || 0
        # the metric should be equal to MAX win count - winCount
        metric = GauntletModule.GAUNTLET_MAX_WINS - winCount
        # minimum is 0
        metric = Math.max(metric,0)
        return Promise.resolve(metric)
      else
        return Promise.reject(new Errors.NoArenaDeckError("Gauntlet deck is incomplete."))


#  ###*
#  # Choose the faction for a user's arena run.
#  # @public
#  # @param  {String}  userId    User ID
#  # @param  {String}  factionId  Faction ID
#  # @return  {Promise}        Promise that will return the arena data on completion.
#  ###
#  @chooseFaction: (userId, factionId) ->
#
#    # userId must be defined
#    if !userId
#      Logger.module("GauntletModule").debug "chooseFaction() -> ERROR: invalid user ID: #{userId}".red
#      return Promise.reject(new Error("invalid user ID: #{userId}"))
#
#    # factionId must be defined
#    if !factionId
#      Logger.module("GauntletModule").debug "chooseFaction() -> ERROR: invalid faction ID: #{factionId}".red
#      return Promise.reject(new Error("invalid faction ID: #{factionId}"))
#
#    NOW_UTC_MOMENT = moment.utc()
#
#    this_obj = {}
#
#    txPromise = knex.transaction (tx)->
#
#      knex("user_gauntlet_run").first().where('user_id',userId).forUpdate().transacting(tx)
#      .bind this_obj
#      .then (existingRun)->
#
#        if existingRun?
#
#          if existingRun.faction_id
#            return Promise.reject(new Errors.InvalidRequestError("You can not chose a faction twice."))
#
#          if existingRun.ended_at
#            return Promise.reject(new Error("Can not choose faction for a finished gauntlet run."))
#
#          if not _.contains(existingRun.faction_choices,factionId)
#            return Promise.reject(new Errors.InvalidRequestError("Invalid faction choice."))
#
#          @.runData = existingRun
#          @.runData.faction_id = factionId
#          @.runData.updated_at = NOW_UTC_MOMENT.toDate()
#
#          GauntletModule._generateCardChoices(txPromise, tx, userId, @.runData.faction_id, 0)
#          .bind(@)
#          .then (cardChoices) ->
#            @.runData.card_choices = cardChoices
#            return knex("user_gauntlet_run").where('user_id',userId).update(
#              faction_id: @.runData.faction_id
#              card_choices: @.runData.card_choices
#              updated_at: @.runData.updated_at
#            ).transacting(tx)
#
#        else
#
#          return Promise.reject(new Errors.NotFoundError("No active gauntlet run found."))
#
#      .then ()-> return DuelystFirebase.connect().getRootRef()
#
#      .then (fbRootRef) ->
#
#        if @.runData.started_at then @.runData.started_at = moment.utc(@.runData.started_at).valueOf()
#        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()
#        if @.runData.ended_at then @.runData.ended_at = moment.utc(@.runData.ended_at).valueOf()
#        if @.runData.created_at then @.runData.created_at = moment.utc(@.runData.created_at).valueOf()
#        if @.runData.completed_at then @.runData.completed_at = moment.utc(@.runData.completed_at).valueOf()
#
#        FirebasePromises.update(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),{
#          faction_id:@.runData.faction_id,
#          card_choices:@.runData.card_choices
#        })
#      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
#      .then tx.commit
#      .catch tx.rollback
#      return
#
#    .bind this_obj
#
#    .then ()->
#
#      Logger.module("GauntletModule").debug "chooseFaction() -> User #{userId.blue}".green + " chose faction #{factionId} for run #{@.runData.ticket_id}.".green
#
#      return Promise.resolve(@.runData)
#
#    return txPromise


  ###*
  # Choose a card for a user's arena run.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  cardId    Card ID
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @chooseCard: (userId, cardId) ->

    # userId must be defined
    if !userId
      Logger.module("GauntletModule").debug "chooseCard() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # cardId must be defined
    if !cardId
      Logger.module("GauntletModule").debug "chooseCard() -> ERROR: invalid faction ID: #{cardId}".red
      return Promise.reject(new Error("invalid card ID: #{cardId}"))


    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      knex("user_gauntlet_run").first().where('user_id',userId).forUpdate().transacting(tx)
      .bind this_obj
      .then (existingRun)->

        if existingRun?

          if existingRun.ended_at
            return Promise.reject(new Error("Can not choose card for a finished gauntlet run."))

          if existingRun.is_complete
            throw new Errors.InvalidRequestError("You can not choose additional cards")

          if existingRun.card_choices? and not _.contains(existingRun.card_choices,cardId)
            throw new Errors.InvalidRequestError("Invalid card choice")

          if existingRun.general_choices? and not _.contains(existingRun.general_choices,cardId)
            throw new Errors.InvalidRequestError("Invalid general choice")

          if not existingRun.card_choices? and not existingRun.general_choices?
            throw new Errors.InvalidRequestError("No existing choices to be made")

          @.runData = existingRun
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()

          @.runData.deck ?= []
          @.runData.deck.push(cardId)
          # The order users should hit the following conditions:
          # User will first be choosing cards, then user will have finished card choice and general choices will be generated,
          # - then deck will be considered complete
          if @.runData.general_choices?
            # Player has just chosen their general
            @.runData.general_choices = null
            @.runData.general_id = cardId
            @.runData.faction_id = SDK.FactionFactory.factionForGeneralId(cardId).id

            # Begin choosing cards
            cardChoicesPromise = GauntletModule._generateCardChoices(txPromise, tx, userId, @.runData.faction_id, @.runData.deck.length, null)
            .bind(@)
            .then (cardChoices) ->
              @.runData.card_choices = cardChoices
#          else if (@.runData.deck.length == CONFIG.MAX_DECK_SIZE_GAUNTLET - 1)
#            # User has just selected their final non-general card, transition to selecting general
#            @.runData.card_choices = null
#            cardChoicesPromise = GauntletModule._generateGeneralChoices(txPromise, tx, userId, @.runData.faction_id)
#            .bind(@)
#            .then (generalCardChoices) ->
#              @.runData.general_choices = generalCardChoices
          else if (@.runData.deck.length == CONFIG.MAX_DECK_SIZE_GAUNTLET)
            # User has just selected their final card,
            @.runData.card_choices = null
            @.runData.is_complete = true
            @.runData.completed_at = NOW_UTC_MOMENT.toDate()
            @.runData.win_count ?= 0
            @.runData.loss_count ?= 0
            @.runData.games ?= []

            cardChoicesPromise = Promise.resolve()
          else
            # User has selected a non final card, continue with selecting card choices
            cardChoicesPromise = GauntletModule._generateCardChoices(txPromise, tx, userId, @.runData.faction_id, @.runData.deck.length,@.runData.deck[@.runData.deck.length-1])
            .bind(@)
            .then (cardChoices) ->
              @.runData.card_choices = cardChoices

          return cardChoicesPromise
          .bind(@)
          .then () ->
            return knex("user_gauntlet_run").where('user_id',userId).update(
              faction_id: @.runData.faction_id
              deck: @.runData.deck
              card_choices: @.runData.card_choices
              general_choices: @.runData.general_choices
              general_id: @.runData.general_id
              is_complete: @.runData.is_complete
              completed_at: @.runData.completed_at
              games: @.runData.GameSession
            ).transacting(tx)
        else
          return Promise.reject(new Errors.NotFoundError("No active gauntlet run found."))
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->
        if @.runData.started_at then @.runData.started_at = moment.utc(@.runData.started_at).valueOf()
        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()
        if @.runData.ended_at then @.runData.ended_at = moment.utc(@.runData.ended_at).valueOf()
        if @.runData.created_at then @.runData.created_at = moment.utc(@.runData.created_at).valueOf()
        if @.runData.completed_at then @.runData.completed_at = moment.utc(@.runData.completed_at).valueOf()

        fbGauntletUpdateData = {
          faction_id: @.runData.faction_id
          deck: @.runData.deck
          card_choices: @.runData.card_choices
          is_complete: @.runData.is_complete
        }

        fbGauntletUpdateData.general_choices = @.runData.general_choices || null

        if @.runData.general_id?
          fbGauntletUpdateData.general_id = @.runData.general_id

        if @.runData.faction_id?
          fbGauntletUpdateData.faction_id = @.runData.faction_id

        FirebasePromises.update(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),fbGauntletUpdateData)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("GauntletModule").debug "chooseCard() -> User #{userId.blue}".green + " chose card #{cardId} at deck slot #{@.runData.deck.length} for run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Generate a 3 card set for a specific faction and round.
  # @private
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}  userId    User ID for which to generate cards.
  # @param  {Integer}  factionId    Faction ID for which to generate cards.
  # @param  {Integer}  round      Which round of choice (0-29) this is for?
  # @return  {Promise}            Promise that resolves with an array of card IDs.
  ###
  @_generateCardChoices: (txPromise, tx, userId, factionId, round, lastCardPickedId)->

    # card ids to return
    cardIds = []

    lastSdkCardPicked = SDK.GameSession.getCardCaches().getCardById(lastCardPickedId)
    modifiedCardTypes = null
    modifiedFactionIds = null
    modifiedRarityIds = null
    if lastSdkCardPicked?
      modifiedCardTypes = lastSdkCardPicked.getModifiedGauntletCardTypes() # Not in use, functionality removed
      modifiedFactionIds = lastSdkCardPicked.getModifiedGauntletFactions()
      modifiedRarityIds = lastSdkCardPicked.getModifiedGauntletRarities()

      if lastSdkCardPicked.getModifiedGauntletOwnFactionFilter()
        modifiedFactionIds = [factionId, factionId, factionId]

    # Gaurenteed legendary on 15th non general card choice
    if round == 15
      modifiedRarityIds = [SDK.Rarity.Legendary,SDK.Rarity.Legendary,SDK.Rarity.Legendary]


    index = round + 1
    random = Math.random()
    rarities = null

    if modifiedRarityIds?
      rarities = modifiedRarityIds
    else if index % 10 == 0 || index == 1
      # sample for legendary on 10,20,30
      if random < 0.89
        rarities = [SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare]
      else if random < 0.99
        rarities = [SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic]
      else
        rarities = [SDK.Rarity.Legendary,SDK.Rarity.Legendary,SDK.Rarity.Legendary]
    else
      # sample for basic
      if random < 0.20
        rarities = [SDK.Rarity.Fixed,SDK.Rarity.Fixed,SDK.Rarity.Fixed]
      else if random < 0.40
        rarities = [SDK.Rarity.Fixed,SDK.Rarity.Fixed,SDK.Rarity.Common]
      else if random < 0.55
        rarities = [SDK.Rarity.Fixed,SDK.Rarity.Common,SDK.Rarity.Common]
      else if random < 0.75
        rarities = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common]
      else if random < 0.87
        rarities = [SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare]
      else if random < 0.97
        rarities = [SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic]
      else
        rarities = [SDK.Rarity.Legendary,SDK.Rarity.Legendary,SDK.Rarity.Legendary]

    # re-roll
    random = Math.random()
    factionComposition = null

    if modifiedFactionIds?
      factionComposition = modifiedFactionIds
    else if rarities[0] == SDK.Rarity.Legendary

      if random < 0.30
        factionComposition = [SDK.Factions.Neutral,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.78
        factionComposition = [factionId,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.90
        factionComposition = [factionId,factionId,SDK.Factions.Neutral]
      else
        factionComposition = [factionId,factionId,factionId]

    else if rarities[0] == SDK.Rarity.Epic

      if random < 0.30
        factionComposition = [SDK.Factions.Neutral,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.68
        factionComposition = [factionId,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.85
        factionComposition = [factionId,factionId,SDK.Factions.Neutral]
      else
        factionComposition = [factionId,factionId,factionId]

    else if rarities[0] == SDK.Rarity.Rare

      if random < 0.30
        factionComposition = [SDK.Factions.Neutral,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.62
        factionComposition = [factionId,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.82
        factionComposition = [factionId,factionId,SDK.Factions.Neutral]
      else
        factionComposition = [factionId,factionId,factionId]

    else

      if random < 0.30
        factionComposition = [SDK.Factions.Neutral,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.57
        factionComposition = [factionId,SDK.Factions.Neutral,SDK.Factions.Neutral]
      else if random < 0.75
        factionComposition = [factionId,factionId,SDK.Factions.Neutral]
      else
        factionComposition = [factionId,factionId,factionId]

    factionComposition = _.shuffle(factionComposition)

    for rarityId, i in rarities

      factionId = factionComposition[i]

      Logger.module("GauntletModule").debug "_generateCardChoices() -> rarity #{rarityId} faction #{factionId}"

      # get all cards to pick from
      cardsInCoreSet = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(factionId).getRarity(rarityId).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getIsSkinned(false).getCards()
      cardsInShimzarSet = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getFaction(factionId).getRarity(rarityId).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getIsSkinned(false).getCards()
      cardsInCombinedSet = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.CombinedUnlockables).getFaction(factionId).getRarity(rarityId).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getIsSkinned(false).getCards()
      cardsInFirstWatchSet = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.FirstWatch).getFaction(factionId).getRarity(rarityId).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getIsSkinned(false).getCards()
      cardsInWartechSet = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Wartech).getFaction(factionId).getRarity(rarityId).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getIsSkinned(false).getCards()
      cardsInCoreshatterSet = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Coreshatter).getFaction(factionId).getRarity(rarityId).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getIsSkinned(false).getCards()

      # Keep this code for next time we emphasize an 'incomplete' set
#      if (rarityId == SDK.Rarity.Rare && factionId == SDK.Factions.Neutral)
#        #No appearance rate change for neutral rares
#        cardsInEmphasizedSet = []
#        cardsInUnemphasizedSet = cardsInCoreShimzarAndBloodbornSet.concat(cardsInUnitySet)
#      else
#        cardsInEmphasizedSet = cardsInUnitySet
#        cardsInUnemphasizedSet = cardsInCoreShimzarAndBloodbornSet

      #cardsInEmphasizedSet = cardsInCoreshatterSet
      cardsInEmphasizedSet = []
      cardsInUnemphasizedSet = cardsInCoreSet.concat(cardsInShimzarSet).concat(cardsInFirstWatchSet).concat(cardsInCombinedSet).concat(cardsInWartechSet).concat(cardsInCoreshatterSet)

      # pick a card and attempt to avoid duplicates
      cardId = null
      attemptsRemaining = 10
      while attemptsRemaining > 0 && (cardId == null || _.contains(cardIds, cardId))
        # choose set
        if cardsInEmphasizedSet.length > 0 && Math.random() < 0.15
          cardsToChooseFrom = cardsInEmphasizedSet
        else
          cardsToChooseFrom = cardsInUnemphasizedSet
        card = cardsToChooseFrom[Math.floor(Math.random() * cardsToChooseFrom.length)]
        cardId = card.getId()
        attemptsRemaining--

      #Logger.module("GauntletModule").debug "_generateCardChoices() -> cardId: #{cardId}"
      cardIds.push(cardId)

    # Give a chance for a rare to be swapped for a special gauntlet card
    if (round != 14 && round != 30) # Do not offer gauntlet special card as last card or before guaranteed legendary
      if (rarities[0] == SDK.Rarity.Rare)
        chanceForSpecialGauntletCard = 0.30
        random = Math.random()
        if (random < chanceForSpecialGauntletCard)
          # replace a random card with a special gauntlet card
          gauntletCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.GauntletSpecial).getIsPrismatic(false).getIsGeneral(false).getIsSkinned(false).getCardIds()
          cardIds[_.random(0,2)] = _.sample(gauntletCardIds)

    # Logger.module("GauntletModule").debug "_generateCardChoices() -> cardIds:",cardIds
    return GauntletModule._getSkinnedCardChoices(txPromise, tx, userId, cardIds)
    .then (skinnedCardIds) ->
      return GauntletModule._getPrismaticCardChoices(txPromise, tx, userId, skinnedCardIds)

  ###*
  # Generate a general set for a specific faction .
  # @private
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}  userId    User ID for which to generate cards.
  # @param  {Integer}  factionId    Faction ID for which to generate generals.
  # @return  {Promise}            Promise that resolves with an array of card IDs.
  ###
  @_generateGeneralChoices:(txPromise, tx, userId)->

    # get all general ids
    allGeneralIds = []
    allFactions = SDK.FactionFactory.getAllPlayableFactions()
    for faction in allFactions
      generalIdsForFaction = SDK.FactionFactory.generalIdsForFaction(faction.id)
      for generalId in generalIdsForFaction
        allGeneralIds.push(generalId)

    generalChoiceIds = _.sample(allGeneralIds,4)

    return GauntletModule._getSkinnedCardChoices(txPromise, tx, userId, generalChoiceIds)
    .then (skinnedGeneralIds) ->
      return GauntletModule._getPrismaticCardChoices(txPromise, tx, userId, skinnedGeneralIds)

  ###*
  # Get skinned versions of a list of card choices for gauntlet. Picks at random from the skins the user owns for each card.
  # @private
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}  userId
  # @param {Array} cardIds
  # @return  {Promise} Promise that resolves with an array of skinned card IDs
  ###
  @_getSkinnedCardChoices:(txPromise, tx, userId, cardIds) ->
    return new Promise (resolve, reject) ->
      cardIdsOut = []

      Promise.map cardIds, (cardId) ->
        return GauntletModule._getSkinnedCardChoice(txPromise, tx, userId, cardId)
        .then (skinnedCardId) ->
          cardIdsOut.push(skinnedCardId)
      .then () ->
        resolve(cardIdsOut)
      .catch (error) ->
        reject(error)

  ###*
  # Get a skinned version of a card choice for gauntlet. Picks at random from the skins the user owns for a card.
  # @private
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}  userId
  # @param {Number} cardId
  # @return  {Promise} promise that resolves with a skinned card ID
  ###
  @_getSkinnedCardChoice:(txPromise, tx, userId, cardId) ->
    cardSkinIds = SDK.CosmeticsFactory.cardSkinIdsForCard(cardId)
    if cardSkinIds.length == 0
      return Promise.resolve(cardId)
    else
      return InventoryModule.filterUsableCosmetics(txPromise, tx, userId, cardSkinIds, SDK.CosmeticsTypeLookup.CardSkin)
      .bind {}
      .then (usableSkinIds) ->
        if usableSkinIds.length <= 0
          return cardId
        else
          return SDK.Cards.getCardIdForCardSkinId(usableSkinIds[Math.floor(Math.random() * usableSkinIds.length)])

  ###*
  # Get a prismatic versions of a list of card choices for gauntlet.
  # @private
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
    # @param {String} userId
    # @param {Number} cardId
  # @return  {Promise} Promise that resolves with an array of prismatic card IDs
  ###
  @_getPrismaticCardChoices:(txPromise, tx, userId, cardIds) ->
    return Promise.resolve(cardIds)

    # DISABLED: prismatics in gauntlet for server performance
    ###
    return new Promise (resolve, reject) ->
      cardIdsOut = cardIds.slice(0)

      # replace card id in the output with usable prismatic card ids
      # base the chance to get a prismatic on how many copies the user has
      Promise.map cardIds, (cardId) ->
        baseCardId = SDK.Cards.getBaseCardId(cardId)
        return tx("user_cards").where('user_id', userId).andWhere('card_id', SDK.Cards.getPrismaticCardId(baseCardId)).first()
        .then (cardRow) ->
          if cardRow?
            if SDK.FactionFactory.cardIdIsGeneral(baseCardId)
              prismaticChance = 1.0
            else
              prismaticChance = Math.min(1.0, cardRow.count / CONFIG.MAX_DECK_DUPLICATES)
            if Math.random() < prismaticChance
              prismaticCardId = SDK.Cards.getPrismaticCardId(cardId)
              for cardIdOut, index in cardIdsOut by -1
                if baseCardId == SDK.Cards.getBaseCardId(cardIdOut)
                  cardIdsOut.splice(index, 1, prismaticCardId)
      .then () ->
        resolve(cardIdsOut)
      .catch (error) ->
        reject(error)
    ###

  ###*
  # Get static reward map that corresponds the the arena reward table.
  # @private
  # @return  {Object}          Static reward map.
  ###
  @_getRewardMap:() ->

    unless @.rewardMap

      # ((\d+) ([A-Z]{1})(\w+))\s
      # "\2 \3",

      # (\w+) Card\s
      # SDK.Rarity.\1,

      # Great Box \((\d)\)\s+
      # great_box_wins[\1] = [

      basic_box_wins = {} # average quantity: ~52.245
      basic_box_wins[0] = [ '5 S',  '10 S',  '15 S',  '15 S',  '20 S',  '20 S',  '5 G',  '10 G']
      basic_box_wins[1] = ['10 S',  '15 S',  '20 S',  '20 S',  '25 S',  '30 S',  '15 G',  '20 G']
      basic_box_wins[2] = ['15 S',  '20 S',  '25 S',  '25 S',  '30 S',  '35 S',  '20 G',  '20 G',  '25 G']
      basic_box_wins[3] = ['25 S',  '30 S',  '35 S',  '35 S',  '40 S',  '45 S',  '10 G',  '10 G',  '15 G']
      basic_box_wins[4] = ['35 S',  '40 S',  '45 S',  '50 S',  '55 S',  '60 S',  '15 G',  '20 G',  '20 G']
      basic_box_wins[5] = ['40 S',  '45 S',  '50 S',  '55 S',  '60 S',  '65 S',  '20 G',  '20 G',  '25 G']
      basic_box_wins[6] = ['45 S',  '50 S',  '55 S',  '60 S',  '65 S',  '70 S',  '25 G',  '25 G',  '30 G']
      basic_box_wins[7] = ['50 S',  '55 S',  '60 S',  '65 S',  '70 S',  '75 S',  '30 G',  '30 G',  '35 G']
      basic_box_wins[8] = ['60 S',  '65 S',  '70 S',  '75 S',  '80 S',  '85 S',  '35 G',  '35 G',  '40 G']
      basic_box_wins[9] = ['70 S',  '75 S',  '80 S',  '85 S',  '90 S',  '95 S',  '40 G',  '40 G',  '45 G']
      basic_box_wins[10] = ['80 S',  '85 S',  '90 S',  '95 S',  '100 S',  '105 S',  '45 G',  '45 G',  '45 G',  '50 G']
      basic_box_wins[11] = ['100 S',  '105 S',  '110 S',  '115 S',  '120 S',  '125 S',  '50 G',  '50 G',  '55 G',  '55 G']
      basic_box_wins[12] = ['120 S',  '125 S',  '130 S',  '135 S',  '140 S',  '145 S',  '60 G',  '60 G',  '65 G',  '65 G']

      gold_box_wins = {} # average quantity: 62.5
      gold_box_wins[3] = ['15 G',  '20 G']
      gold_box_wins[4] = ['25 G',  '30 G']
      gold_box_wins[5] = ['35 G',  '40 G']
      gold_box_wins[6] = ['45 G',  '50 G']
      gold_box_wins[7] = ['55 G',  '60 G']
      gold_box_wins[8] = ['65 G',  '70 G']
      gold_box_wins[9] = ['75 G',  '80 G']
      gold_box_wins[10] = ['85 G','90 G']
      gold_box_wins[11] = ['95 G','100 G']
      gold_box_wins[12] = ['105 G','110 G']

      good_box_wins = {}
      good_box_wins[3] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[4] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[5] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[6] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[7] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[8] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[9] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[10] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[11] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]
      good_box_wins[12] = [SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic]


      great_box_wins = {}
      great_box_wins[10] = [SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Legendary]
      great_box_wins[11] = [SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Legendary]
      great_box_wins[12] = [SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Legendary]

      awesome_box_wins = {}
      awesome_box_wins[12] = [SDK.Rarity.Rare,SDK.Rarity.Rare,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Epic,SDK.Rarity.Legendary,SDK.Rarity.Legendary,'1 ORB','1 ORB']

      @.rewardMap =
        basic_box_wins:basic_box_wins
        gold_box_wins:gold_box_wins
        good_box_wins:good_box_wins
        great_box_wins:great_box_wins
        awesome_box_wins:awesome_box_wins

    return @.rewardMap



module.exports = GauntletModule
