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
GamesModule = require './games'
DataAccessHelpers = require './helpers'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'

# redis
{Redis, Jobs, RiftManager} = require '../../redis/'

# SDK imports
SDK = require '../../../app/sdk'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
RiftHelper = require 'app/sdk/rift/riftHelper'

class RiftModule

  ###*
  # Max wins for matchmaking purposes.
  # @public
  ###
  @RIFT_MAX_WINS_FOR_MATCHMAKING: 200

  ###*
  # Initial rating a rift deck starts at
  # @public
  ###
  @RIFT_DEFAULT_RATING: 400

  ###*
  # The max rating a rift deck gains/loses a percentage of per match
  # @public
  ###
  @RIFT_MAX_RATING_DELTA: 30

  ###*
  # The min rating a rift deck gains/loses a percentage of per match
  # @public
  ###
  @RIFT_MIN_RATING_DELTA: 10

  ###*
  # The max rating difference between two players before rating gain/loss is reduced
  # @public
  ###
  @RIFT_RATING_DIFFERENCE_FOR_MAX_RATING_GAIN: 100

  ###*
  # The max rating difference between two players before rating gain/loss is reduced
  # @public
  ###
  @RIFT_RATING_DIFFERENCE_FOR_MIN_RATING_GAIN: 500

  ###*
  # The max rift upgrades a player can store up for later use
  # @public
  ###
  @RIFT_MAX_STORED_UPGRADES: 10

  ###*
  # The amount of rift upgrades a user gets for their first rift run
  # @public
  ###
  @RIFT_FIRST_RUN_FREE_UPGRADES: 5

  ###*
  # Use soft currency (gold) to buy an rift ticket for a user.
  # @public
  # @param  {String}  userId    User ID for which to buy an rift ticket.
  # @return  {Promise}        Promise that will post RIFT TICKET ID on completion.
  ###
  @buyRiftTicketWithGold: (userId) ->

    # userId must be defined
    unless userId
      Logger.module("RiftModule").log "buyRiftTicketWithGold() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not buy rift ticket with gold : invalid user ID - #{userId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}
    txPromise = knex.transaction (tx)->

      tx.first()
        .from('users')
        .where('id',userId)
        .forUpdate()
      .bind this_obj
      .then (userRow)->

        # if the user has enough gold
        if userRow.wallet_gold >= CONFIG.RIFT_TICKET_GOLD_PRICE

          # calculate final gold
          final_wallet_gold = @.final_wallet_gold = userRow.wallet_gold - CONFIG.RIFT_TICKET_GOLD_PRICE

          # setup what to update the user params with
          userUpdateParams =
            wallet_gold:    final_wallet_gold
            wallet_updated_at:   NOW_UTC_MOMENT.toDate()

          return tx("users").where('id',userId).update(userUpdateParams)

        else

          Logger.module("RiftModule").log "buyRiftTicketWithGold() -> Cannot buy ticket because user #{userId.blue} has insufficient funds".red
          return Promise.reject(new Errors.InsufficientFundsError("Insufficient funds in wallet to buy rift ticket for #{userId}"))

      .then ()->
        return RiftModule.addRiftTicketToUser(txPromise, tx,userId, "soft")
      .then (ticketId)->
        @.ticketId = ticketId
        userCurrencyLogItem =
          id:          generatePushId()
          user_id:      userId
          gold:        -CONFIG.RIFT_TICKET_GOLD_PRICE
          memo:        "rift ticket #{ticketId}"
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

      Logger.module("RiftModule").log "buyRiftTicketWithGold() -> User #{userId.blue}".green + " purchased ticket #{@.ticketId}.".green

      return Promise.resolve(@.ticketId)

    # return the transaction promise
    return txPromise



  ###*
  # Claims a users first free rift ticket if they have no tickets or rift runs
  # @public
  # @param  {String}    userId            User ID for which to buy a rift ticket.
  # @return  {Promise}    Promise that will post TICKET ID on completion.
  ###
  @claimFirstFreeRiftTicket: (userId)->

    # userId must be defined
    unless userId
      Logger.module("RiftModule").log "claimFirstFreeRiftTicket() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not claim free rift ticket : invalid user ID - #{userId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      Promise.all([
        tx("users").first('id').where('id',userId).forUpdate(),
        tx("user_rift_tickets").first().where('user_id',userId).forUpdate(),
        tx("user_rift_tickets_used").first().where('user_id',userId).forUpdate(), # This is redundant with runs but used for future proofing
        tx("user_rift_runs").first().where('user_id',userId).forUpdate()
      ])
      .bind this_obj
      .spread (userRow,ticketRow, usedTicketRow,existingRun)->
        # Can not already have a ticket
        if ticketRow?
          Logger.module("RiftModule").log "claimFirstFreeRiftTicket() -> user ID - #{userId} already has a ticket.".red
          return Promise.reject(new Error("Can not claim free rift ticket : user ID - #{userId} already has a ticket"))

        # Can not already have a used ticket
        if usedTicketRow?
          Logger.module("RiftModule").log "claimFirstFreeRiftTicket() -> user ID - #{userId} already has a ticket.".red
          return Promise.reject(new Error("Can not claim free rift ticket : user ID - #{userId} already has a used ticket"))

        # Can not already have an active run
        if existingRun?
          Logger.module("RiftModule").log "claimFirstFreeRiftTicket() -> user ID - #{userId} already has an active run.".red
          return Promise.reject(new Error("Can not claim free rift ticket : user ID - #{userId} already has an active rift run"))

        # If user passes the above tests they can have a free rift ticket
        return RiftModule.addRiftTicketToUser(txPromise,tx,userId,"free")
      .then (ticketId) ->
        @.ticketId = ticketId
        return SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("RiftModule").debug "claimFirstFreeRiftTicket() -> User #{userId.blue}".green + " claimed free first rift ticket #{@.ticketId}.".green

      return Promise.resolve(@.ticketId)

    return txPromise


  ###*
  # Add a rift ticket to a user's inventory for a specified transaction type.
  # @public
  # @param  {Promise}    trxPromise          Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  trx              KNEX transaction to attach this operation to.
  # @param  {String}    userId            User ID for which to buy a rift ticket.
  # @param  {String}    transactionType        'soft','hard','gauntlet', or 'xp'.
  # @param  {String}    transactionId        the identifier for the transaction that caused this ticket to be added.
  # @return  {Promise}    Promise that will post TICKET ID on completion.
  ###
  @addRiftTicketToUser: (trxPromise, trx, userId, transactionType, transactionId=null)->

    # userId must be defined
    unless userId
      Logger.module("RiftModule").log "addRiftTicketToUser() -> invalid user ID - #{userId}.".red
      return Promise.reject(new Error("Can not add rift ticket : invalid user ID - #{userId}"))

    # userId must be defined
    unless trx
      Logger.module("RiftModule").log "addRiftTicketToUser() -> invalid trx - #{trx}.".red
      return Promise.reject(new Error("Can not add rift ticket : invalid transaction parameter"))

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
    .into("user_rift_tickets")
    .transacting(trx)
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      tickets = fbRootRef.child("user-inventory").child(userId).child("rift-tickets")
      data =
        created_at:NOW_UTC_MOMENT.valueOf()
        transaction_type:transactionType
      return FirebasePromises.set(tickets.child(ticketId),data)
    .then ()->
      Logger.module("RiftModule").log "addRiftTicketToUser() -> added #{ticketId} to user #{userId.blue}.".green
      return Promise.resolve(ticketId)

  ###*
  # Start an rift run for a user.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  ticketId  Rift ticket ID to use
  # @return  {Promise}        Promise that will return the rift data on completion.
  ###
  @startRun: (userId,ticketId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "startRun() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # ticketId must be defined
    if !ticketId
      Logger.module("RiftModule").log "startRun() -> ERROR: invalid ticket ID: #{ticketId}".red
      return Promise.reject(new Error("invalid ticket ID: #{ticketId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      Promise.all([
        tx("users").first('rift_stored_upgrade_count').where('id',userId).forUpdate(),
        tx("user_rift_tickets").first().where('id',ticketId).forUpdate(),
        tx("user_rift_runs").first().where('user_id',userId).forUpdate(),
        tx("user_rift_run_stored_upgrades").select("id").where('user_id',userId).andWhere("assigned_ticket_id",null).forUpdate()
      ])
      .bind this_obj
      .spread (userRow,ticketRow,existingRun,storedUpgradeRows)->

        @.ticketRow = ticketRow
        @.isFirstRun = false
        if (not existingRun?)
          @.isFirstRun = true

        @.storedUpgradeRows = storedUpgradeRows

        if ticketRow and ticketRow?.user_id == userId

          @.ticketRow.used_at = NOW_UTC_MOMENT.toDate()

          @.runData =
            user_id: userId
            ticket_id: ticketId
            created_at: NOW_UTC_MOMENT.toDate()
            deck: []

          if @.isFirstRun
            @.runData.upgrades_available_count = RiftModule.RIFT_FIRST_RUN_FREE_UPGRADES

          # TODO: must make sure fb and db are updated with user total stored upgrades to 0

          if @.storedUpgradeRows?
            @.runData.stored_upgrades = _.map(@.storedUpgradeRows, (row) -> return row.id)

          return RiftModule._generateGeneralChoices(txPromise, tx, userId)

        else

          return Promise.reject(new Errors.NotFoundError("Could not start run: rift ticket not found."))

      .then (generalCardChoices) ->
        @.runData.general_choices = generalCardChoices
        delete @.ticketRow.is_unread
        return Promise.all([
          tx("user_rift_tickets").delete().where('id',ticketId),
          tx("user_rift_tickets_used").insert(@.ticketRow),
          tx("user_rift_runs").insert(@.runData),
          tx("users").where("id",userId).update(
            rift_stored_upgrade_count: 0
          )
        ])
      .then () ->
        storedUpgradeUpdatePromises = []
        for row in @.storedUpgradeRows
          storedUpgradeUpdatePromises.push tx("user_rift_run_stored_upgrades").where("id",row.id).update(
            assigned_ticket_id: ticketId
          )
        return Promise.all(storedUpgradeUpdatePromises)

      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->

        @.runData = DataAccessHelpers.restifyData(@.runData)

        allfbPromises = []
        allfbPromises.push FirebasePromises.remove(fbRootRef.child("user-inventory").child(userId).child("rift-tickets").child(ticketId))
        allfbPromises.push FirebasePromises.set(fbRootRef.child("user-rift-runs").child(userId).child(ticketId),@.runData)
        allfbPromises.push FirebasePromises.set(fbRootRef.child("users").child(userId).child("rift_stored_upgrade_count"),0)

        return Promise.all(allfbPromises)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      Logger.module("RiftModule").log "startRun() -> User #{userId.blue}".green + " started run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Choose a card for a user's rift run.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  generalId  General ID
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @chooseGeneral: (userId, ticketId, generalId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "chooseGeneral() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # generalId must be defined
    if !generalId
      Logger.module("RiftModule").log "chooseGeneral() -> ERROR: invalid general ID: #{generalId}".red
      return Promise.reject(new Error("invalid general ID: #{generalId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      tx("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',ticketId).forUpdate()
      .bind this_obj
      .then (existingRun)->

        if existingRun?

          if existingRun.general_choices? and not _.contains(existingRun.general_choices, generalId)
            throw new Errors.InvalidRequestError("Invalid general choice")

          if existingRun.general_id?
            throw new Errors.InvalidRequestError("Rift run general selection already exists")

          @.runData = existingRun
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()
          @.runData.general_id = generalId
          @.runData.faction_id = SDK.CardFactory.cardForIdentifier(generalId,SDK.GameSession.current()).getFactionId()
          @.runData.deck = _.map(SDK.FactionFactory.starterDeckForFactionLevel(@.runData.faction_id,12),(c)-> return c.id)
          @.runData.deck.shift()
          @.runData.deck.unshift(generalId)

          return tx("user_rift_runs").where('user_id',userId).andWhere('ticket_id',ticketId).update(
            updated_at: @.runData.updated_at
            general_id: @.runData.general_id
            faction_id: @.runData.faction_id
            deck: @.runData.deck
          )

        else

          return Promise.reject(new Errors.NotFoundError("Rift run not found."))

      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()

        fbRiftUpdateData = {
          general_id: @.runData.general_id
          faction_id: @.runData.faction_id
          deck: @.runData.deck
        }

        FirebasePromises.update(fbRootRef.child("user-rift-runs").child(userId).child(ticketId),fbRiftUpdateData)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("RiftModule").log "chooseGeneral() -> User #{userId.blue}".green + " chose general #{generalId} for run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Update a user's current arena run based on the outcome of a game
  # @public
  # @param  {String}  userId      User ID for which to update.
  # @param  {String}  ticketId    Run Ticket ID
  # @param  {Boolean}  isWinner    Did the user win the game?
  # @param  {String}  gameId      Game unique ID
  # @param  {Boolean}  isDraw      Are we updating for a draw?
  # @return  {Promise}          Promise that will notify when complete.
  ###
  @updateRiftRunWithGameOutcome: (userId,ticketId,isWinner,gameId,isDraw,damageDealt,gameSessionData) ->

    if (gameSessionData? and gameSessionData.aiPlayerId? and gameSessionData.aiPlayerId == userId)
      # This was a bot, return gracefully
      return Promise.resolve()

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "updateRiftRunWithGameOutcome() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # ticketId must be defined
    if !ticketId
      Logger.module("RiftModule").log "updateRiftRunWithGameOutcome() -> ERROR: invalid ticket ID: #{ticketId}".red
      return Promise.reject(new Error("invalid ticket ID: #{ticketId}"))


    # gameId must be defined
    if !gameId
      Logger.module("RiftModule").log "updateRiftRunWithGameOutcome() -> ERROR: invalid game ID: #{gameId}".red
      return Promise.reject(new Error("invalid gameId ID: #{gameId}"))

    # gameSessionData must be defined and have set up data
    if !gameSessionData? or !gameSessionData.gameSetupData?
      Logger.module("RiftModule").log "updateRiftRunWithGameOutcome() -> ERROR: invalid game data: #{gameSessionData}".red
      return Promise.reject(new Error("invalid game data: #{gameSessionData}"))

    Logger.module("RiftModule").debug "updateRiftRunWithGameOutcome() -> user #{userId} ticket #{ticketId}"

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    return knex.transaction (tx)->

      return Promise.resolve(tx("users").first('id').where('id',userId).forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',ticketId).forUpdate()
        ])
      .spread (userRow,existingRun)->
        if existingRun?
          allPromises = []
          @.runData = existingRun

          if not existingRun.started_at
            existingRun.started_at = NOW_UTC_MOMENT.toDate()

          @.runData.rift_level ?= 1

          damageDealt = damageDealt || 0
          riftPointsEarned = Math.min(damageDealt,25) || 0
          if isWinner
            riftPointsEarned += 10
          upgradesEarned = 0
          riftLevelBefore = RiftHelper.levelForPoints(existingRun.rift_points)
          riftLevelAfter = RiftHelper.levelForPoints(existingRun.rift_points + riftPointsEarned)
          if riftLevelBefore < riftLevelAfter
            upgradesEarned = riftLevelAfter - riftLevelBefore

          @.riftPointsEarned = riftPointsEarned

          @.runData.updated_at = NOW_UTC_MOMENT.toDate()
          @.runData.games ?= []
          @.runData.rift_points ?= 0
          @.runData.rift_points += @.riftPointsEarned
          @.runData.upgrades_available_count ?= 0
          @.runData.upgrades_available_count += upgradesEarned
          @.runData.rift_level ?= 1
          @.runData.rift_level += upgradesEarned

          # Rift rating
          riftRatingBefore = @.runData.rift_rating
          if (not riftRatingBefore?)
            riftRatingBefore = RiftModule.RIFT_DEFAULT_RATING

          riftRatingDelta = 0
          if (not isDraw)
            winnerUserId = UtilsGameSession.getWinningPlayerId(gameSessionData)
            winnerRiftRating = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSessionData,winnerUserId)?.riftRating
            loserRiftRating = UtilsGameSession.getPlayerSetupDataForPlayerId(gameSessionData,UtilsGameSession.getOpponentIdToPlayerId(gameSessionData,winnerUserId))?.riftRating

            riftRatingDelta = RiftModule._getRiftRatingDeltaForGameRiftRatings(winnerRiftRating,loserRiftRating)
            if (not isWinner)
              riftRatingDelta = -1 * riftRatingDelta

            # Make sure that even if the enemy player is zeroing out on rating, this player still at least gets the minimum rating
            if (isWinner)
              riftRatingDelta = Math.max(riftRatingDelta,RiftModule.RIFT_MIN_RATING_DELTA)

          @.riftRatingDelta = riftRatingDelta
          riftRatingAfter = riftRatingBefore + riftRatingDelta

          @.runData.rift_rating = riftRatingAfter

          if isDraw
            @.runData.draw_count += 1
          else if isWinner
            @.runData.win_count += 1
          else
            @.runData.loss_count += 1

          @.runData.games.push(gameId)

          Logger.module("RiftModule").debug "updateRiftRunWithGameOutcome() -> rift level: #{@.runData.rift_level} points: #{@.runData.rift_points} points earned: #{@.riftPointsEarned}"

          allPromises.push tx("user_rift_runs").where('user_id',userId).andWhere('ticket_id',ticketId).update(
            loss_count: @.runData.loss_count
            win_count: @.runData.win_count
            draw_count: @.runData.draw_count
            games: @.runData.games
            updated_at: @.runData.updated_at
            rift_points: @.runData.rift_points
            upgrades_available_count: @.runData.upgrades_available_count
            started_at: @.runData.started_at
            rift_level: @.runData.rift_level
            rift_rating: @.runData.rift_rating
          )

          allPromises.push tx("user_games").where('user_id',userId).andWhere('game_id',gameId).update(
            rift_ticket_id: @.runData.ticket_id
            rift_points: @.runData.rift_points
            rift_points_earned: @.riftPointsEarned
            rift_rating_after: @.runData.rift_rating
            rift_rating_earned: @.riftRatingDelta
          )

          return Promise.all(allPromises)

        else
          return Promise.reject(new Errors.NotFoundError("Rift run not found."))

      .then () ->
        # Update redis
        return RiftManager.updateUserRunRiftRating(userId,ticketId,@.runData.rift_rating,NOW_UTC_MOMENT)
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .bind this_obj
      .then (fbRootRef) ->

        allFbPromises = []

        allFbPromises.push FirebasePromises.update(fbRootRef.child("user-rift-runs").child(userId).child(ticketId),{
          loss_count: @.runData.loss_count
          win_count: @.runData.win_count
          draw_count: @.runData.draw_count
          rift_points: @.runData.rift_points
          upgrades_available_count: @.runData.upgrades_available_count
          rift_level: @.runData.rift_level
          rift_rating: @.runData.rift_rating
        })

        # update game record
        allFbPromises.push FirebasePromises.set(fbRootRef.child('user-games').child(userId).child(gameId).child('rift_points'),@.runData.rift_points)
        allFbPromises.push FirebasePromises.set(fbRootRef.child('user-games').child(userId).child(gameId).child('rift_points_earned'),@.riftPointsEarned)
        allFbPromises.push FirebasePromises.set(fbRootRef.child('user-games').child(userId).child(gameId).child('rift_rating_after'),@.runData.rift_rating)
        allFbPromises.push FirebasePromises.set(fbRootRef.child('user-games').child(userId).child(gameId).child('rift_rating_earned'),@.riftRatingDelta)

        return Promise.all(allFbPromises)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("RiftModule").error "updateArenaRunWithGameOutcome() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    .then ()-> return Promise.resolve(@.runData)
    .finally ()-> return GamesModule.markClientGameJobStatusAsComplete(userId,gameId,'rift')

  ###*
  # Get the arena deck for a user.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  ticketId  Run Ticket ID
  # @return  {Promise}        Promise that will return the arena deck on completion or error out with a NoArenaDeckError.
  ###
  @getRiftRunDeck: (userId,ticketId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "getArenaDeck() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    return knex("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',ticketId)
    .then (run)->
      Logger.module("RiftModule").debug "getRiftRunDeck() -> found deck for #{userId}: ", run?.deck
      if run?.deck?.length > 0
        # copy deck
        deck = run.deck.slice(0)
        return Promise.resolve(deck)
      else
        return Promise.reject(new Errors.NoArenaDeckError("Could not load user #{userId} rift #{ticketId} deck."))

  ###*
  # Gets a users Rift rating for the run with provided ticket id
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  ticketId  Run Ticket ID
  # @return  {Promise}        Promise that will resolve to the integer rift rating on completion.
  ###
  @getRunRating: (userId,ticketId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "getRunRating() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # ticketId must be defined
    if !ticketId
      Logger.module("RiftModule").log "getRunRating() -> ERROR: invalid ticket ID: #{ticketId}".red
      return Promise.reject(new Error("invalid ticket ID: #{ticketId}"))

    return knex("user_rift_runs").first("rift_rating").where('user_id',userId).andWhere('ticket_id',ticketId)
    .then (runRow)->
      if runRow?
        if runRow.rift_rating?
          return runRow.rift_rating
        else
          return RiftModule.RIFT_DEFAULT_RATING
      else
        return Promise.reject(new Errors.NotFoundError("Rift run not found."))

  ###*
  # Get a matchmaking metric for the user's rift run.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  ticketId  Run Ticket ID
  # @return  {Promise}        Promise that will resolve the integer metric on completion.
  ###
  @getRunMatchmakingMetric: (userId,ticketId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "getRunMatchmakingMetric() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # ticketId must be defined
    if !ticketId
      Logger.module("RiftModule").log "getRunMatchmakingMetric() -> ERROR: invalid ticket ID: #{ticketId}".red
      return Promise.reject(new Error("invalid ticket ID: #{ticketId}"))

    return knex("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',ticketId)
    .then (run)->
      if run
        rating = run.rift_rating
        if not rating?
          rating = RiftModule.RIFT_DEFAULT_RATING

        # Clamp rating between 0 to 4000 for metric and map to 0-100
        clampedRating = Math.max(Math.min(4000,rating),0)
        metric = clampedRating / 4000
        return Promise.resolve(metric)
      else
        return Promise.reject(new Errors.NotFoundError("Rift run not found."))

  ###*
  # Choose a card for a user's rift run.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  cardId    Card ID
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @chooseCardToUpgrade: (userId, ticketId, cardId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "chooseCardToUpgrade() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # cardId must be defined
    if !cardId
      Logger.module("RiftModule").log "chooseCardToUpgrade() -> ERROR: invalid faction ID: #{cardId}".red
      return Promise.reject(new Error("invalid card ID: #{cardId}"))

    if SDK.FactionFactory.cardIdIsGeneral(cardId)
      return Promise.reject(new Error("Can not upgrade your general"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      tx("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',ticketId).forUpdate()
      .bind this_obj
      .then (existingRun)->

        if existingRun?
          hasStoredUpgrades = existingRun.stored_upgrades? && existingRun.stored_upgrades.length > 0
          existingRun.upgrades_available_count ?= 0

          if not existingRun.upgrades_available_count > 0 && not hasStoredUpgrades
            return Promise.reject(new Errors.BadRequestError("Rift run not can not be upgraded."))

          @.runData = existingRun
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()
          @.runData.card_id_to_upgrade = cardId

          cardChoicesPromise = null
          if hasStoredUpgrades
            @.storedUpgradeUsedId = @.runData.stored_upgrades.pop()
            @.runData.disable_storing_upgrade = true
            cardChoicesPromise = tx("user_rift_run_stored_upgrades").first().where('user_id',userId).andWhere('id',@.storedUpgradeUsedId)
            .bind this_obj
            .then (storedUpgradeRow) ->
              if not storedUpgradeRow? or not storedUpgradeRow.card_choices?
                return Promise.reject(new Errors.BadRequestError("Rift run stored upgrade #{@.storedUpgradeUsedId} does not exist or belong to user #{userId}."))
              return Promise.resolve(storedUpgradeRow.card_choices)
          else
            # User has selected a non final card, continue with selecting card choices
            @.runData.upgrades_available_count -= 1
            cardChoicesPromise = RiftModule._generateCardUpgradeChoices(txPromise, tx, userId, ticketId, @.runData.faction_id, cardId)

          return cardChoicesPromise
          .bind(@)
          .then (cardChoices) ->
            @.runData.card_choices = cardChoices
            allCardChoicePromises = []
            allCardChoicePromises.push tx("user_rift_runs").where('user_id',userId).andWhere('ticket_id',ticketId).update(
              card_id_to_upgrade: @.runData.card_id_to_upgrade
              updated_at: @.runData.updated_at
              upgrades_available_count: @.runData.upgrades_available_count
              card_choices: @.runData.card_choices
              stored_upgrades: @.runData.stored_upgrades
              disable_storing_upgrade: @.runData.disable_storing_upgrade
            )

            if @.storedUpgradeUsedId?
              allCardChoicePromises.push tx("user_rift_run_stored_upgrades").where("id",@.storedUpgradeUsedId).delete()

            return Promise.all(allCardChoicePromises)

        else

          return Promise.reject(new Errors.NotFoundError("Rift run not found."))

      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()

        fbRiftUpdateData = {
          card_choices: @.runData.card_choices
          card_id_to_upgrade: @.runData.card_id_to_upgrade
          upgrades_available_count: @.runData.upgrades_available_count
          stored_upgrades: @.runData.stored_upgrades
        }

        return FirebasePromises.update(fbRootRef.child("user-rift-runs").child(userId).child(ticketId),fbRiftUpdateData)

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("RiftModule").log "chooseCardToUpgrade() -> User #{userId.blue}".green + " chose card #{cardId} for upgrade in run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Returns the
  # @public
  # @param  {Integer}  winnerRiftRating    Rift rating of winner
  # @param  {Integer}  loserRiftRating      Rift rating of loser
  # @return  {Integer}  The delta for rift rating after match
  ###
  @_getRiftRatingDeltaForGameRiftRatings: (winnerRiftRating, loserRiftRating) ->
    if not winnerRiftRating?
      winnerRiftRating = RiftModule.RIFT_DEFAULT_RATING
    if not loserRiftRating?
      loserRiftRating = RiftModule.RIFT_DEFAULT_RATING

    ratingAlphaDivisor = RiftModule.RIFT_RATING_DIFFERENCE_FOR_MIN_RATING_GAIN - RiftModule.RIFT_RATING_DIFFERENCE_FOR_MAX_RATING_GAIN
    ratingAlphaQuotient = (winnerRiftRating - loserRiftRating)
    ratingAlphaQuotient = Math.max(ratingAlphaQuotient,RiftModule.RIFT_RATING_DIFFERENCE_FOR_MAX_RATING_GAIN)
    ratingAlphaQuotient = Math.min(ratingAlphaQuotient,RiftModule.RIFT_RATING_DIFFERENCE_FOR_MIN_RATING_GAIN)
    ratingAlphaQuotient = ratingAlphaQuotient - RiftModule.RIFT_RATING_DIFFERENCE_FOR_MAX_RATING_GAIN

    ratingAlpha = 1.0 - ratingAlphaQuotient / ratingAlphaDivisor

    ratingDelta = RiftModule.RIFT_MIN_RATING_DELTA + (RiftModule.RIFT_MAX_RATING_DELTA - RiftModule.RIFT_MIN_RATING_DELTA) * ratingAlpha
    ratingDelta = Math.floor(ratingDelta)

    # Prevent delta from ever taking loser below 0
    if (loserRiftRating - ratingDelta < 0)
      ratingDelta = loserRiftRating

    return ratingDelta


  ###*
  # Upgrade a card for a user's rift run.
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  cardId    Card ID to upgrade
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @upgradeCard: (userId, ticketId, cardId) ->

    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "upgradeCard() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # cardId must be defined
    if !cardId
      Logger.module("RiftModule").log "upgradeCard() -> ERROR: invalid card ID: #{cardId}".red
      return Promise.reject(new Error("invalid card ID: #{cardId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      tx("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',ticketId).forUpdate()
      .bind this_obj
      .then (existingRun)->

        if existingRun?
          if not existingRun.card_choices
            throw new Errors.BadRequestError("Invalid card choices for current run") # Where the error occurs

          if not existingRun.card_id_to_upgrade
            throw new Errors.BadRequestError("No card selected to upgrade") # Where the error occurs

          if existingRun.card_choices? and not _.contains(existingRun.card_choices,cardId)
            throw new Errors.BadRequestError("Invalid card choice")

          indexOfCardToUpgrade = existingRun.deck.indexOf(existingRun.card_id_to_upgrade)

          @.runData = existingRun
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()
          @.runData.card_id_to_upgrade = null
          @.runData.card_choices = null
          @.runData.disable_storing_upgrade = null
          @.runData.deck.splice(indexOfCardToUpgrade,1)
          @.runData.deck.push(cardId)
          @.runData.current_upgrade_reroll_count = 0

          return tx("user_rift_runs").where('user_id',userId).andWhere('ticket_id',ticketId).update(
            deck: @.runData.deck
            card_id_to_upgrade: @.runData.card_id_to_upgrade
            card_choices: @.runData.card_choices
            disable_storing_upgrade: @.runData.disable_storing_upgrade
            updated_at: @.runData.updated_at
            current_upgrade_reroll_count: @.runData.current_upgrade_reroll_count
          )

        else

          return Promise.reject(new Errors.NotFoundError("Rift run not found."))

      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()

        fbRiftUpdateData = {
          deck: @.runData.deck
          card_id_to_upgrade: null
          card_choices: null
          current_upgrade_reroll_count: @.runData.current_upgrade_reroll_count
        }

        FirebasePromises.update(fbRootRef.child("user-rift-runs").child(userId).child(ticketId),fbRiftUpdateData)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("RiftModule").log "upgradeCard() -> User #{userId.blue}".green + " chose card #{cardId} as upgrade for run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Generate a 3 card set for a specific faction and round.
  # @private
  # @param  {Promise}    txPromise     KNEX transaction promise
  # @param  {Transaction}  tx         KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID for which to generate cards.
  # @param  {Integer}    cardId      Card ID being upgraded
  # @param  {Integer}    riftLevel    Current rift level (number of upgrades so far)
  # @return  {Promise}            Promise that resolves with an array of card IDs.
  ###
  @_generateCardUpgradeChoices: (txPromise, tx, userId, ticketId, factionId, cardId, riftLevel)->

    Logger.module("RiftModule").debug "_generateCardUpgradeChoices() -> User #{userId.blue} generating choices for #{factionId} for ticket #{ticketId}"

    # card ids to return
    cardIds = []

    random = Math.random()
    rarities = null

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
      Logger.module("RiftModule").debug "_generateCardChoices() -> card: #{cardId}"
      return cardId

    # inline function for picking a random card set
    randomCardSet = (rarityId, factionId, excludeNeutralBloodborn, excludeUnity)->
      excludeNeutralBloodborn ?= false
      excludeNeutralBloodborn ?= false
      cardSetChoices = [
        SDK.CardSet.Core
        SDK.CardSet.Core
        SDK.CardSet.Core
        SDK.CardSet.Core
        SDK.CardSet.Shimzar
        SDK.CardSet.Shimzar
        SDK.CardSet.Shimzar
      ]
      factionId == SDK.Factions.Neutral
      excludeBloodbornForEpicNeutralFlag = (rarityId == SDK.Rarity.Epic && factionId == SDK.Factions.Neutral)
      excludeNeutralBloodbornFlag = (factionId == SDK.Factions.Neutral && excludeNeutralBloodborn)
      if not excludeBloodbornForEpicNeutralFlag and not excludeNeutralBloodbornFlag
        cardSetChoices.push SDK.CardSet.Bloodborn
        cardSetChoices.push SDK.CardSet.Bloodborn


      includeUnitySet = true
      includeUnitySet = includeUnitySet and (not excludeUnity)
      includeUnitySet = includeUnitySet and not (rarityId == SDK.Rarity.Epic and factionId == SDK.Factions.Neutral)
      if includeUnitySet
        cardSetChoices.push SDK.CardSet.Unity
        cardSetChoices.push SDK.CardSet.Unity

      cs = _.sample(cardSetChoices)
      Logger.module("RiftModule").debug "_generateCardChoices() -> card set: #{cs}"
      return cs

    randomFaction = ()->
      factions = _.map(SDK.FactionFactory.getAllEnabledFactions(), (f)-> return f.id)

      factions.push(factionId)
      factions.push(factionId)
      factions.push(factionId)
      factions.push(factionId)
      factions.push(factionId)

      factions.push(SDK.Factions.Neutral)
      factions.push(SDK.Factions.Neutral)
      factions.push(SDK.Factions.Neutral)
      factions.push(SDK.Factions.Neutral)
      factions.push(SDK.Factions.Neutral)

      fId = _.sample(factions)
      Logger.module("RiftModule").debug "_generateCardChoices() -> faction #{fId} of factions:",factions
      return fId

    # fill slot 1 to 2
    randomFactionId = randomFaction()
    cardIds.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(randomCardSet(SDK.Rarity.Common,randomFactionId)).getFaction(randomFactionId).getRarity(SDK.Rarity.Common).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getCardIds(),cardIds,0.04,50))
    randomFactionId = randomFaction()
    cardIds.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(randomCardSet(SDK.Rarity.Common,randomFactionId,true,true)).getFaction(randomFactionId).getRarity(SDK.Rarity.Common).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getCardIds(),cardIds,0.04,50))
    randomFactionId = randomFaction()
    cardIds.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(randomCardSet(SDK.Rarity.Rare,randomFactionId)).getFaction(randomFactionId).getRarity(SDK.Rarity.Rare).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getCardIds(),cardIds,0.04,50))
    randomFactionId = randomFaction()
    cardIds.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(randomCardSet(SDK.Rarity.Rare,randomFactionId,true,true)).getFaction(randomFactionId).getRarity(SDK.Rarity.Rare).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getCardIds(),cardIds,0.04,50))
    randomFactionId = randomFaction()
    cardIds.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(randomCardSet(SDK.Rarity.Epic,randomFactionId)).getFaction(randomFactionId).getRarity(SDK.Rarity.Epic).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getCardIds(),cardIds,0.04,50))
    randomFactionId = randomFaction()
    cardIds.push(randomCardFromCollectionWithoutDupes(SDK.GameSession.getCardCaches().getCardSet(randomCardSet(SDK.Rarity.Legendary,randomFactionId)).getFaction(randomFactionId).getRarity(SDK.Rarity.Legendary).getIsPrismatic(false).getIsGeneral(false).getIsHiddenInCollection(false).getCardIds(),cardIds,0.04,50))

    Logger.module("RiftModule").debug "_generateCardChoices() -> cardIds:",cardIds

    return RiftModule._getSkinnedCardChoices(txPromise, tx, userId, cardIds)
    .then (skinnedCardIds) ->
      return RiftModule._getPrismaticCardChoices(txPromise, tx, userId, skinnedCardIds)


  ###*
  # Checks if a run needs the card choices to be rerolled due to dupes, and
  # if there are dupes it will reroll the card choices
  # @public
  # @param  {Object}  riftRunRow    sql row of the run to be sanitized
  # @return  {Promise}        Promise that will resolve to the new (or same if not changed) rift run row data
  ###
  @sanitizeRunCardChoicesIfNeeded: (riftRunRow,systemTime) ->
    NOW_UTC_MOMENT = systemTime || moment.utc()

#    testRunsLastUpdateBeforeMoment = moment.utc("2017-04-29 12:00")

    if not riftRunRow.card_choices?
      # No card choices, no need to sanitize
      return Promise.resolve(riftRunRow)


      # TODO: This can be done for performance but it might open edge cases without much gain
#    runUpdatedAtMoment = moment.utc(riftRunRow.updated_at)
#    if testRunsLastUpdateBeforeMoment.isBefore(runUpdatedAtMoment)
#      # Last
#      return Promise.resolve(riftRunRow)

    if riftRunRow.card_choices.length == _.unique(riftRunRow.card_choices).length
      # There are no dupes in card choices, no need to sanitize
      return Promise.resolve(riftRunRow)


    this_obj = {}

    this_obj.riftRunData = riftRunRow
    this_obj.userId = riftRunRow.user_id
    this_obj.ticketId = riftRunRow.ticket_id
    this_obj.factionId = riftRunRow.faction_id
    this_obj.cardIdToUpgrade = riftRunRow.card_id_to_upgrade
    this_obj.riftLevel = riftRunRow.rift_level

    txPromise = knex.transaction (tx)->
      return tx("users").first('id').where('id',this_obj.userId).forUpdate()
      .bind this_obj
      .then ()->
        return RiftModule._generateCardUpgradeChoices(txPromise,tx,@.userId,@.ticketId,@.factionId,@.cardIdToUpgrade,@.riftLevel)
      .then (cardChoices)->
        @.riftRunData.card_choices = cardChoices
        @.riftRunData.updated_at = NOW_UTC_MOMENT.toDate()
        return tx("user_rift_runs").where('ticket_id',@.ticketId).andWhere('user_id',@.userId).update({
          card_choices: @.riftRunData.card_choices
          updated_at: @.riftRunData.updated_at
        })
      .then ()->
        return Promise.resolve(@.riftRunData)
    return txPromise


  ###*
  # Stores a user rift run's current upgrade for next rift run started
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  riftTicketId    Rift ticket id
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @storeCurrentUpgrade: (userId,riftTicketId) ->
    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "storeCurrentUpgrade() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # cardId must be defined
    if !riftTicketId
      Logger.module("RiftModule").log "storeCurrentUpgrade() -> ERROR: invalid rift ID: #{riftTicketId}".red
      return Promise.reject(new Error("invalid card ID: #{riftTicketId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.all([
        tx("users").first('rift_stored_upgrade_count').where('id',userId).forUpdate(),
        tx("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',riftTicketId).forUpdate()
      ]).bind this_obj
      .spread (userRow,existingRun)->
        if not userRow?
          throw new Errors.BadRequestError("User id not found: #{userId}")

        if userRow.rift_stored_upgrade_count? and userRow.rift_stored_upgrade_count >= RiftModule.RIFT_MAX_STORED_UPGRADES
          throw new Errors.MaxRiftUpgradesReachedError("User #{userId} already has max rift upgrades stored")

        @.userRow = userRow

        # TODO: check this works as intended
        @.userRow.rift_stored_upgrade_count ?= 0

        if existingRun?
          allPromises = []

          if not existingRun.card_choices?
            throw new Errors.BadRequestError("No card choices to store")

          if existingRun.disable_storing_upgrade == true
            throw new Errors.BadRequestError("User #{userId} can not store current upgrade for rift run #{riftRicketId}")

          @.storedCardChoices = existingRun.card_choices


          @.runData = existingRun
          @.runData.card_id_to_upgrade = null
          @.runData.card_choices = null
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()

          allPromises.push tx("user_rift_runs").where('user_id',userId).andWhere('ticket_id',riftTicketId).update(
            card_id_to_upgrade: @.runData.card_id_to_upgrade
            card_choices: @.runData.card_choices
            updated_at: @.runData.updated_at
          )


          allPromises.push tx("users").where('id',userId).update(
            rift_stored_upgrade_count: @.userRow.rift_stored_upgrade_count + 1
          )

          allPromises.push tx("user_rift_run_stored_upgrades").insert(
            id: generatePushId()
            user_id: userId
            source_ticket_id: riftTicketId
            created_at: NOW_UTC_MOMENT.toDate()
            updated_at: NOW_UTC_MOMENT.toDate()
            card_choices: @.storedCardChoices
          )

          return Promise.all(allPromises)

        else

          return Promise.reject(new Errors.NotFoundError("Rift run not found."))

      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        allFbPromises = []

        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()

        fbRiftUpdateData = {
          deck: @.runData.deck
          card_id_to_upgrade: null
          card_choices: null
        }

        fbUserUpdateData = {
          rift_stored_upgrade_count: @.userRow.rift_stored_upgrade_count + 1
        }

        allFbPromises.push FirebasePromises.update(fbRootRef.child("user-rift-runs").child(userId).child(riftTicketId),fbRiftUpdateData)
        allFbPromises.push FirebasePromises.update(fbRootRef.child("users").child(userId),fbUserUpdateData)

        return Promise.all(allFbPromises)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("RiftModule").log "storeCurrentUpgrade() -> User #{userId.blue}".green + " store upgrade for run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise

  ###*
  # Reroll's a user rift run's current upgrades for a spirit cost
  # @public
  # @param  {String}  userId    User ID
  # @param  {String}  riftTicketId    Rift ticket id
  # @return  {Promise}        Promise that will return the arena data on completion.
  ###
  @rerollCurrentUpgrade: (userId,riftTicketId) ->
    # userId must be defined
    if !userId
      Logger.module("RiftModule").log "rerollCurrentUpgrade() -> ERROR: invalid user ID: #{userId}".red
      return Promise.reject(new Error("invalid user ID: #{userId}"))

    # cardId must be defined
    if !riftTicketId
      Logger.module("RiftModule").log "rerollCurrentUpgrade() -> ERROR: invalid rift ID: #{riftTicketId}".red
      return Promise.reject(new Error("invalid card ID: #{riftTicketId}"))

    NOW_UTC_MOMENT = moment.utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.all([
        tx("users").first('wallet_spirit').where('id',userId).forUpdate(),
        tx("user_rift_runs").first().where('user_id',userId).andWhere('ticket_id',riftTicketId).forUpdate()
      ]).bind this_obj
      .spread (userRow,existingRun)->
        if not userRow?
          throw new Errors.BadRequestError("User id not found: #{userId}")

        @.userRow = userRow


        if existingRun?
          @.runData = existingRun

          # Defaults
          @.currentRerollCount = @.runData.current_upgrade_reroll_count or 0
          @.totalRerollCount = @.runData.total_reroll_count or 0
          @.userSpirit = @.userRow.wallet_spirit or 0

          # Updated run data
          @.runData.total_reroll_count = @.totalRerollCount + 1
          @.runData.current_upgrade_reroll_count = @.currentRerollCount + 1
          @.runData.updated_at = NOW_UTC_MOMENT.toDate()


          @.rerollSpiritCost = RiftHelper.spiritCostForNextReroll(@.currentRerollCount,@.totalRerollCount)
          if @.userSpirit < @.rerollSpiritCost
            Logger.module("RiftModule").log "rerollCurrentUpgrade() -> Cannot reroll current upgrade because user #{userId.blue} has insufficient funds".red
            return Promise.reject(new Errors.InsufficientFundsError("Insufficient funds in wallet to reroll current rift upgrade #{userId}"))

          if not existingRun.card_choices?
            throw new Errors.BadRequestError("No card choices to upgrade")

          return RiftModule._generateCardUpgradeChoices(txPromise,tx,userId,riftTicketId,existingRun.faction_id,existingRun.card_id_to_upgrade,existingRun.rift_level)
        else

          return Promise.reject(new Errors.NotFoundError("Rift run not found."))

      .then (cardChoices) ->
        allPromises = []

        @.newCardChoices = cardChoices

        @.runData.card_choices = @.newCardChoices

        allPromises.push tx("user_rift_runs").where('user_id',userId).andWhere('ticket_id',riftTicketId).update(
          card_choices: @.runData.card_choices
          total_reroll_count: @.runData.total_reroll_count
          current_upgrade_reroll_count: @.runData.current_upgrade_reroll_count
          updated_at: @.runData.updated_at
        )

        allPromises.push InventoryModule.debitSpiritFromUser(txPromise,tx,userId,-1*@.rerollSpiritCost,"rift reroll","#{riftTicketId}:#{@.totalRerollCount}")

        return Promise.all(allPromises)


      .then ()-> return DuelystFirebase.connect().getRootRef()

      .then (fbRootRef) ->

        allFbPromises = []

        if @.runData.updated_at then @.runData.updated_at = moment.utc(@.runData.updated_at).valueOf()

        fbRiftUpdateData = {
          card_choices: @.runData.card_choices
          total_reroll_count: @.runData.total_reroll_count
          current_upgrade_reroll_count: @.runData.current_upgrade_reroll_count
        }

        allFbPromises.push FirebasePromises.update(fbRootRef.child("user-rift-runs").child(userId).child(riftTicketId),fbRiftUpdateData)

        return Promise.all(allFbPromises)
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj

    .then ()->

      Logger.module("RiftModule").debug "rerollCurrentUpgrade() -> User #{userId.blue}".green + " rerolled upgrade for run #{@.runData.ticket_id}.".green

      return Promise.resolve(@.runData)

    return txPromise


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
    generalIds = _.map(SDK.FactionFactory.getAllPlayableFactions(), (f)-> return f.generalIds?.slice(0) || [])
    generalIds = _.flatten(generalIds)
    generalIds = _.sample(generalIds,4)

    return RiftModule._getSkinnedCardChoices(txPromise, tx, userId, generalIds)
    .then (skinnedGeneralIds) ->
      return RiftModule._getPrismaticCardChoices(txPromise, tx, userId, skinnedGeneralIds)

  ###*
  # Get skinned versions of a list of card choices for gauntlet. Picks at random from the skins the user owns for each card.
  # @private
  # @param  {Promise}  txPromise KNEX transaction promise
  # @param  {Transaction}  tx KNEX transaction to attach this operation to.
  # @param  {String}  userId
  # @param   {Array} cardIds
  # @return  {Promise} Promise that resolves with an array of skinned card IDs
  ###
  @_getSkinnedCardChoices:(txPromise, tx, userId, cardIds) ->
    return new Promise (resolve, reject) ->
      cardIdsOut = []

      Promise.map cardIds, (cardId) ->
        return RiftModule._getSkinnedCardChoice(txPromise, tx, userId, cardId)
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
  # @param   {Number} cardId
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

module.exports = RiftModule
