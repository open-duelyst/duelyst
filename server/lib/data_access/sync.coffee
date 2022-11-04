Promise = require 'bluebird'
util = require 'util'
colors = require 'colors'
uuid = require 'node-uuid'
moment = require 'moment'
_ = require 'underscore'

FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
fbUtil = require '../../../app/common/utils/utils_firebase.js'
Logger = require '../../../app/common/logger.coffee'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
DataAccessHelpers = require('./helpers')

# SDK imports
SDK = require '../../../app/sdk'
QuestFactory = require '../../../app/sdk/quests/questFactory'
QuestType = require '../../../app/sdk/quests/questTypeLookup'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
CosmeticsLookup = require '../../../app/sdk/cosmetics/cosmeticsLookup'

# redis
{SRankManager} = require '../../redis/'

class SyncModule

  ###*
  # Mark user's firebase data with a version string
  # @private
  # @param  {String}      userId    User ID
  # @param  {String}      hash    Hash string
  # @return  {Promise}            Promise that will resolve on completion.
  ###
  @_bumpUserTransactionCounter: (tx,userId)->

    return Promise.all([
      knex("users").increment("tx_count",1).where('id',userId).transacting(tx),
      DuelystFirebase.connect().getRootRef().then (rootRef)->
        updateVersion = (counter)->
          counter ?= {}
          counter.count ?= 0
          counter.count += 1
          return counter
        return FirebasePromises.safeTransaction(rootRef.child('users').child(userId).child('tx_counter'),updateVersion)
    ])

  ###*
  # Check a user's transaction counter, and sync data to Firebase if tx count not equal.
  # @public
  # @param  {String}  userId        User ID.
  # @return  {Promise}            Promise that will resolve on completion
  ###
  @syncUserDataIfTrasactionCountMismatched: (userId)->

    return DuelystFirebase.connect().getRootRef()
    .bind {}
    .then (fbRootRef)->
      @.fbRootRef = fbRootRef
      return Promise.all([
        knex.first('tx_count').from('users').where('id',userId),
        FirebasePromises.once(@.fbRootRef.child('users').child(userId).child('tx_counter').child('count'),'value')
      ])
    .spread (userRow,txCountSnapshot)->

      @.firebaseTxCount = txCountSnapshot.val()
      shouldSyncBuddyList = false

      # if there is NO transaction count value, sync the buddy list to the one last known in the DB
      # the assumption is that the user record is missing all together and needs a buddy list sync
      if not @.firebaseTxCount?
        shouldSyncBuddyList = true

      if not userRow
        throw new Errors.NotFoundError("Could not find user")

      if userRow.tx_count != @.firebaseTxCount
        @.needsSync = true
        return SyncModule._syncUserFromSQLToFirebase(userId,shouldSyncBuddyList)
      else
        @.needsSync = false

    .then ()->

      if @.needsSync
        Logger.module("SyncModule").log "syncUserDataIfTrasactionCountMismatched() -> #{userId} syncing: #{@.needsSync}".green

      return @.needsSync

  ###*
  # Wipe user data.
  # @public
  # @param  {String}  userId        User ID.
  # @return  {Promise}            Promise that will resolve on completion
  ###
  @wipeUserData: (userId)->

    Logger.module("SyncModule").time "wipeUserData() -> #{userId.blue} wiped"

    return DuelystFirebase.connect().getRootRef()
    .bind {}
    .then (fbRootRef)->
      @.fbRootRef = fbRootRef

      return knex("user_rank_ratings").where('user_id',userId).select("season_starting_at")
    .then (userRatingsRows) ->
      # User needs to be removed from redis for each season they have a rating for
      return Promise.map(userRatingsRows,(ratingRow) ->
        startOfSeasonMoment = moment.utc(ratingRow.season_starting_at)
        return SRankManager._removeUserFromLadder(userId,startOfSeasonMoment)
      )
    .then () ->

      fbRootRef = @.fbRootRef

      allPromises = [
        FirebasePromises.remove(fbRootRef.child('user-transactions').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-logs').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-quests').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-ranking').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-aggregates').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-decks').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-games').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-progression').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-faction-progression').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-challenge-progression').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-gauntlet-run').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-news').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-matchmaking-errors').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-stats').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-rewards').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-achievements').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-ribbons').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-purchase-counts').child(userId)),
        FirebasePromises.remove(fbRootRef.child('user-rift-runs').child(userId)),
        FirebasePromises.update(fbRootRef.child('users').child(userId),{
          ltv:0
          total_orb_count_set_3: 0
          rift_stored_upgrade_count: 0
          free_card_of_the_day_claimed_at: null
        }),

        knex("user_rank_events").where('user_id',userId).delete(),
        knex("user_rank_history").where('user_id',userId).delete(),
        knex("user_charges").where('user_id',userId).delete(),
        knex("user_gauntlet_run").where('user_id',userId).delete(),
        knex("user_gauntlet_run_complete").where('user_id',userId).delete(),
        knex("user_gauntlet_tickets").where('user_id',userId).delete(),
        knex("user_gauntlet_tickets_used").where('user_id',userId).delete(),
        knex("user_spirit_orbs").where('user_id',userId).delete(),
        knex("user_spirit_orbs").where({'user_id':'some-other-test-user'}).delete(),
        knex("user_spirit_orbs_opened").where('user_id',userId).delete(),
        knex("user_cards").where('user_id',userId).delete(),
        knex("user_card_log").where('user_id',userId).delete(),
        knex("user_card_collection").where('user_id',userId).delete(),
        knex("user_currency_log").where('user_id',userId).delete(),
        knex("user_decks").where('user_id',userId).delete(),
        knex("user_games").where('user_id',userId).delete(),
        knex("user_progression").where('user_id',userId).delete(),
        knex("user_progression_days").where('user_id',userId).delete(),
        knex("user_faction_progression").where('user_id',userId).delete(),
        knex("user_faction_progression_events").where('user_id',userId).delete(),
        knex("user_quests").where('user_id',userId).delete(),
        knex("user_quests_complete").where('user_id',userId).delete(),
        knex("user_rewards").where('user_id',userId).delete(),
        knex("user_new_player_progression").where('user_id',userId).delete(),
        knex("user_challenges").where('user_id',userId).delete(),
        # knex("user_emotes").where('user_id',userId).delete(),
        knex("user_achievements").where('user_id',userId).delete(),
        knex("user_game_counters").where('user_id',userId).delete(),
        knex("user_game_faction_counters").where('user_id',userId).delete(),
        knex("user_game_general_counters").where('user_id',userId).delete(),
        knex("user_game_season_counters").where('user_id',userId).delete(),
        knex("user_ribbons").where('user_id',userId).delete(),
        knex("user_referrals").where('user_id',userId).delete(),
        knex("user_referral_events").where('referrer_id',userId).delete(),
        knex("user_rank_ratings").where('user_id',userId).delete(),
        knex("user_codex_inventory").where('user_id',userId).delete(),
        knex("user_daily_challenges_completed").where('user_id',userId).delete(),
        knex("user_card_lore_inventory").where('user_id',userId).delete(),
        knex("user_cosmetic_chests").where('user_id',userId).delete(),
        knex("user_cosmetic_chests_opened").where('user_id',userId).delete(),
        knex("user_cosmetic_chest_keys").where('user_id',userId).delete(),
        knex("user_cosmetic_chest_keys_used").where('user_id',userId).delete(),
        knex("user_cosmetic_inventory").where('user_id',userId).delete(),
        knex("gift_codes").where('claimed_by_user_id',userId).delete(),
        knex("user_gift_crates").where('user_id',userId).delete(),
        knex("user_rift_runs").where('user_id',userId).delete(),
        knex("user_rift_tickets").where('user_id',userId).delete(),
        knex("user_rift_tickets_used").where('user_id',userId).delete(),
        knex("user_rift_run_stored_upgrades").where('user_id',userId).delete(),
        # knex("user_buddies").where('user_id',userId).delete(),
        knex("users").where('id',userId).update({
          last_purchase_at:null,
          purchase_count:0,
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
          daily_quests_updated_at:null,
          stripe_customer_id:null,
          username_updated_at:null,
          referred_by_user_id:null,
          referral_rewards_claimed_at:null,
          referral_rewards_updated_at:null
          top_rank_ladder_position:null,
          top_rank_rating:null,
          is_bot:false,
          last_retention_gift_at:null,
          soft_wipe_count:0,
          last_soft_twipe_at:null
          first_purchased_at:null
          has_purchased_starter_bundle:null
          portrait_id: null
          total_orb_count_set_3: 0
          total_orb_count_set_4: null
          free_card_of_the_day_claimed_at: null
          free_card_of_the_day_claimed_count: 0
          rift_stored_upgrade_count: 0
        })
      ]

      referralCode = referralCodeRow?.code
      if referralCode?
        allPromises.push knex("referral_events").where('code',referralCode).delete()

      return Promise.all(allPromises)

    .then ()->
      Logger.module("SyncModule").timeEnd "wipeUserData() -> #{userId.blue} wiped"
  # ###*
  # # Completely remove all user data from DB and Firebase.
  # # @private
  # # @param  {String}  userId        User ID.
  # # @return  {Promise}            Promise that will resolve on completion
  # ###
  # @destroyUserData: (userId)->

  #   return DuelystFirebase.connect().getRootRef()
  #   .bind {}
  #   .then (fbRootRef)->
  #     return Promise.all([
  #       FirebasePromises.remove(fbRootRef.child('user-transactions').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-logs').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-quests').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-ranking').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-aggregates').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-decks').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-games').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-progression').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-faction-progression').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-challenge-progression').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-gauntlet-run').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-news').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-matchmaking-errors').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-stats').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-rewards').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('user-achievements').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('users').child(userId)),
  #       FirebasePromises.remove(fbRootRef.child('username-index').child(userId)),

  #       knex("user_rank_events").where('user_id',userId).delete(),
  #       knex("user_rank_history").where('user_id',userId).delete(),
  #       knex("user_charges").where('user_id',userId).delete(),
  #       knex("user_gauntlet_run").where('user_id',userId).delete(),
  #       knex("user_gauntlet_run_complete").where('user_id',userId).delete(),
  #       knex("user_gauntlet_tickets").where('user_id',userId).delete(),
  #       knex("user_gauntlet_tickets_used").where('user_id',userId).delete(),
  #       knex("user_spirit_orbs").where('user_id',userId).delete(),
  #       knex("user_spirit_orbs").where({'user_id':'some-other-test-user'}).delete(),
  #       knex("user_spirit_orbs_opened").where('user_id',userId).delete(),
  #       knex("user_cards").where('user_id',userId).delete(),
  #       knex("user_card_log").where('user_id',userId).delete(),
  #       knex("user_card_collection").where('user_id',userId).delete(),
  #       knex("user_currency_log").where('user_id',userId).delete(),
  #       knex("user_decks").where('user_id',userId).delete(),
  #       knex("user_games").where('user_id',userId).delete(),
  #       knex("user_progression").where('user_id',userId).delete(),
  #       knex("user_progression_days").where('user_id',userId).delete(),
  #       knex("user_faction_progression").where('user_id',userId).delete(),
  #       knex("user_faction_progression_events").where('user_id',userId).delete(),
  #       knex("user_quests").where('user_id',userId).delete(),
  #       knex("user_quests_complete").where('user_id',userId).delete(),
  #       knex("user_rewards").where('user_id',userId).delete(),
  #       knex("user_new_player_progression").where('user_id',userId).delete(),
  #       knex("user_challenges").where('user_id',userId).delete(),
  #       knex("user_emotes").where('user_id',userId).delete(),
  #       knex("user_achievements").where('user_id',userId).delete(),
  #      knex("user_game_counters").where('user_id',userId).delete(),
  #      knex("user_game_faction_counters").where('user_id',userId).delete(),
  #      knex("user_game_season_counters").where('user_id',userId).delete(),
  #      knex("user_buddies").where('user_id',userId).delete(),
  #       knex("users").where('id',userId).delete()
  #     ])

  ###*
  # Sync a user's buddy list from Firebase to SQL. This is inteded to be used periodically as a job (such as on login)
  # @private
  # @param  {String}  userId        User ID.
  # @return  {Promise}            Promise that will resolve on completion
  ###
  @syncBuddyListFromFirebaseToSQL: (userId)->

    Logger.module("SyncModule").time "syncBuddyListFromFirebaseToSQL() -> start"

    MOMENT_NOW_UTC = moment().utc()

    return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      Logger.module("SyncModule").time "syncBuddyListFromFirebaseToSQL() -> loading..."
      return FirebasePromises.once(fbRootRef.child("users").child(userId).child('buddies'),"value")
    .then (buddiesSnapshot)->
      return Promise.all([
        knex("user_buddies").where('user_id',userId).select(),
        buddiesSnapshot.val()
      ])
    .spread (buddyRows,buddies)->

      if buddyRows?.length > 0 or buddies?

        allPromises = []
        for buddy,obj of buddies
          unless _.find(buddyRows,(row)-> return row.buddy_id == buddy)
            allPromises.push knex("user_buddies").insert({
              'user_id':userId,
              'buddy_id':buddy,
              'created_at':moment.utc(obj.createdAt).toDate() || MOMENT_NOW_UTC.toDate()
            })
        for row in buddyRows
          unless _.find(_.keys(buddies), (buddy)-> return buddy == row.buddy_id)
            allPromises.push knex("user_buddies").where({
              'user_id':userId,
              'buddy_id':buddy,
            }).delete()

        allPromises.push knex("users").where('id','userId').update({'buddy_count':_.keys(buddies).length})

        return Promise.all(allPromises)

  ###*
  # Sync a user's data from SQL to Firebase.
  # @private
  # @param  {String}  userId          User ID.
  # @param  {Boolean}  shouldSyncBuddyList    Should the buddy list be synced? Defaults to FALSE
  # @return  {Promise}              Promise that will resolve on completion
  ###
  @_syncUserFromSQLToFirebase: (userId,shouldSyncBuddyList=false)->

    Logger.module("UsersModule").time "_syncUserFromSQLToFirebase() -> #{userId} + buddies:#{shouldSyncBuddyList}".green

    return DuelystFirebase.connect().getRootRef()
    .bind {}
    .then (fbRootRef)->
      @.fbRootRef = fbRootRef
      return knex.first().from('users').where('id',userId)
    .then (userRow)->

      if not userRow
        throw new Error("Could not find user")

      @.userData = userRow

      Logger.module("UsersModule").time "_syncUserFromSQLToFirebase() -> #{userId} ",@.userData

    .then ()->

      return Promise.all([
        knex.select().from("user_cards").where('user_id',userId)
        knex.first().from('user_card_collection').where('user_id',userId)
        knex.select().from('user_rank_history').where('user_id',userId)
        knex.select().from('user_charges').where('user_id',userId)
        knex.first().from('user_gauntlet_run').where('user_id',userId)
        knex.select().from('user_gauntlet_tickets').where('user_id',userId)
        knex.select().from('user_spirit_orbs').where('user_id',userId)
        knex.select().from('user_decks').where('user_id',userId)
        knex.first().from('user_progression').where('user_id',userId)
        knex.select().from('user_faction_progression').where('user_id',userId)
        knex.select().from('user_quests').where('user_id',userId)
        knex.select().from('user_rewards').where('user_id',userId)
        knex.select().from('user_challenges').where('user_id',userId)
        knex.select().from('user_new_player_progression').where('user_id',userId)
        knex.select().from('user_achievements').whereNotNull('completed_at').andWhere('user_id',userId)
        knex.select().from('user_buddies').where('user_id',userId),
        knex.select().from('user_game_counters').where('user_id',userId),
        knex.select().from('user_game_faction_counters').where('user_id',userId),
        knex.select().from('user_ribbons').where('user_id',userId),
        knex.select().from('user_rank_ratings').where('user_id',userId),
        knex.select().from('user_codex_inventory').where('user_id',userId),
        knex.select().from("user_cosmetic_chests").where('user_id',userId),
        knex.select().from("user_cosmetic_chest_keys").where('user_id',userId),
        knex.select().from("user_cosmetic_inventory").where('user_id',userId),
        knex.select().from("user_bosses_defeated").where('user_id',userId),
        knex.select().from("user_rift_runs").where('user_id',userId)
      ])

    .spread (cardRows,cardCollection,rankHistoryRows,chargeRows,gauntletRun,gauntletTicketRows,spiritOrbRows,decks,progression,factionProgressionRows,questRows,rewardRows,challengeRows,newPlayerModules,completedAchievements,buddyRows,gameCounterRows,factionGameCounterRows,userRibbonRows,userRankRatings,userCodexRows,userCosmeticChests,userCosmeticChestKeys,userCosmeticInventory,userBossesDefeated,userRiftRuns)->

      allPromises = []


      userData = {
        id:      @.userData.id
        username:   @.userData.username
        created_at: moment.utc(@.userData.created_at).valueOf()
        has_purchased_starter_bundle: @.userData.has_purchased_starter_bundle
        rift_stored_upgrade_count: @.userData.rift_stored_upgrade_count
        free_card_of_the_day_claimed_at:moment.utc(@.userData.free_card_of_the_day_claimed_at || 0).valueOf()
      }

      if shouldSyncBuddyList
        userData.buddies = {}
        for row in buddyRows
          userData.buddies[row.buddy_id] = { createdAt:moment.utc(row.created_at).valueOf() }

      # user profile
      allPromises.push(FirebasePromises.update(@.fbRootRef.child('users').child(userId),userData))

      # indexes
      allPromises.push(FirebasePromises.set(@.fbRootRef.child('username-index').child(@.userData.username),userId))

      # Inventory
      if cardRows.length > 0
        allCardsJson = _.reduce(cardRows, (memo,row)->
          memo[row.card_id] ?= {}
          memo[row.card_id].count = row.count
          memo[row.card_id].is_unread = row.is_unread
          memo[row.card_id].is_new = row.is_new
          return memo
        , {})
        console.log allCardsJson
        allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('card-collection'),allCardsJson))
      else
        allPromises.push(FirebasePromises.remove(@.fbRootRef.child('user-inventory').child(userId).child('card-collection')))

      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('wallet'),{
        gold_amount:       @.userData.wallet_gold
        spirit_amount:       @.userData.wallet_spirit
        updated_at:       moment.utc(@.userData.wallet_updated_at).valueOf() || null
        card_last_four_digits:  @.userData.card_last_four_digits
      }))

      fbOrbs = {}
      for orb in spiritOrbRows
        orbId = orb.id
        delete orb.user_id
        delete orb.id
        fbOrbs[orbId] = DataAccessHelpers.restifyData(orb)
      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('spirit-orbs'),fbOrbs))

      fbTickets = {}
      for ticket in gauntletTicketRows
        ticketId = ticket.id
        delete ticket.user_id
        delete ticket.id
        fbTickets[ticketId] = DataAccessHelpers.restifyData(ticket)
      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('gauntlet-tickets'),fbTickets))

      # Gauntlet
      if gauntletRun
        allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-gauntlet-run').child(userId).child('current'),DataAccessHelpers.restifyData(gauntletRun)))

      # Progression
      if progression
        allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-progression').child(userId).child('game-counter'),DataAccessHelpers.restifyData(progression)))
      for factionProgression in factionProgressionRows
        delete factionProgression.user_id
        allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-faction-progression').child(userId).child(factionProgression.faction_id).child('stats'),DataAccessHelpers.restifyData(factionProgression)))

      # Quests
      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-quests').child(userId).child('daily').child('current'),{
        updated_at: moment.utc(@.userData.daily_quests_updated_at).valueOf() || null
        generated_at: moment.utc(@.userData.daily_quests_generated_at).valueOf() || null
      }))

      fbQuests = {}
      for quest in questRows
        slotIndex = quest.quest_slot_index
        delete quest.user_id
        delete quest.quest_slot_index
        fbQuests[slotIndex] = DataAccessHelpers.restifyData(quest)
      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-quests').child(userId).child('daily').child('current').child('quests'),fbQuests))

      # Rank
      if @.userData.rank_starting_at?
        allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-ranking').child(userId).child('current'),{
          rank: @.userData.rank
          stars: @.userData.rank_stars
          stars_required: @.userData.rank_stars_required
          updated_at: moment.utc(@.userData.rank_updated_at).valueOf() || null
          created_at: moment.utc(@.userData.rank_created_at).valueOf()
          starting_at: moment.utc(@.userData.rank_starting_at).valueOf()
        }))

      if @.userData.top_rank_starting_at?
        allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-ranking').child(userId).child('top'),{
          rank: @.userData.top_rank
          updated_at: moment.utc(@.userData.top_rank_updated_at).valueOf() || null
          starting_at: moment.utc(@.userData.top_rank_starting_at).valueOf()
        }))

      # # Challenges
      # fbChallenges = {}
      # for challenge in challengeRows
      #   challengeId = challenge.challenge_id
      #   delete challenge.user_id
      #   # delete challenge.challenge_id
      #   fbChallenges[challengeId] = DataAccessHelpers.restifyData(challenge)
      # allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-challenge-progression').child(userId),fbChallenges))

      # # Decks
      # for deck in decks
      #   delete deck.user_id
      #   allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-decks').child(userId).child(deck.id),DataAccessHelpers.restifyData(deck)))

      # # New Player Progression
      # for module in newPlayerModules
      #   delete module.user_id
      #   allPromises.push(FirebasePromises.set(@.fbRootRef.child('new-player-progression').child(userId).child('modules').child(module.module_name),DataAccessHelpers.restifyData(module)))

      # Achievements
      lastCompletedAt = null
      fbAchievements = {}
      for row in completedAchievements

        if row.completed_at > lastCompletedAt
          lastCompletedAt = row.completed_at
          allPromises.push FirebasePromises.set(@.fbRootRef.child("user-achievements").child(userId).child("status").child('last_read_at'),lastCompletedAt)

        delete row.user_id
        delete row.progress
        delete row.progress_required

        fbAchievements[row.achievement_id] = DataAccessHelpers.restifyData(row)

      allPromises.push FirebasePromises.set(@.fbRootRef.child("user-achievements").child(userId).child("completed"),fbAchievements)

      # Codex inventory
      for row in userCodexRows
        # Place data in fb for storage after the transaction has completed
        fbCodexInventoryChapterData =
          chapter_id: row.chapter_id
          is_unread: false
          updated_at: moment.utc(row.updated_at).valueOf()
          created_at: moment.utc(row.created_at).valueOf()
        allPromises.push FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('codex').child(row.chapter_id),fbCodexInventoryChapterData)

      # Cosmetic chests
      fbUserCosmeticChestData = {}
      for row in userCosmeticChests
        # Place data in fb for storage after the transaction has completed
        fbCosmeticChestData = DataAccessHelpers.restifyData(row)
        fbUserCosmeticChestData[row.chest_id] = fbCosmeticChestData
      if (userCosmeticChests.length > 0)
        allPromises.push FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('cosmetic-chests'),fbUserCosmeticChestData)
      else
        allPromises.push FirebasePromises.remove(@.fbRootRef.child('user-inventory').child(userId).child('cosmetic-chests'),fbUserCosmeticChestData)


      # Cosmetic chest keys
      fbUserCosmeticChestKeyData = {}
      for row in userCosmeticChestKeys
        # Place data in fb for storage after the transaction has completed
        fbCosmeticChestKeyData = DataAccessHelpers.restifyData(row)
        fbUserCosmeticChestKeyData[row.key_id] = fbCosmeticChestKeyData
      if (userCosmeticChestKeys.length > 0)
        allPromises.push FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('cosmetic-chest-keys'),fbUserCosmeticChestKeyData)
      else
        allPromises.push FirebasePromises.remove(@.fbRootRef.child('user-inventory').child(userId).child('cosmetic-chest-keys'),fbUserCosmeticChestKeyData)

      # Cosmetic inventory
      for row in userCosmeticInventory
        # Place data in fb for storage after the transaction has completed
        fbCosmeticData =
          cosmetic_id: row.cosmetic_id
          created_at: moment.utc(row.created_at).valueOf()
        allPromises.push FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('cosmetic-inventory').child(row.cosmetic_id),fbCosmeticData)


      # for row in gameCounterRows
      #   gameType = row.game_type
      #   delete row.user_id
      #   delete row.game_type
      #   allPromises.push FirebasePromises.update(rootRef.child('user-game-counters').child(userId).child(gameType).child('stats'),DataAccessHelpers.restifyData(row))

      # for row in factionGameCounterRows
      #   factionId = row.faction_id
      #   gameType = row.game_type
      #   delete row.user_id
      #   delete row.faction_id
      #   delete row.game_type
      #   allPromises.push FirebasePromises.update(rootRef.child('user-game-counters').child(userId).child(gameType).child('factions').child(factionId),DataAccessHelpers.restifyData(row))

      # sync ribbons
      fbRibbonData = {}
      for ribbon in userRibbonRows
        fbRibbonData[ribbon.ribbon_id] ?= { ribbon_id:ribbon.ribbon_id, count:0, updated_at:moment.utc(ribbon.created_at).valueOf() }
        fbRibbonData[ribbon.ribbon_id].count += 1
      allPromises.push FirebasePromises.set(@.fbRootRef.child("user-ribbons").child(userId),fbRibbonData)

      # sync ladder positions
      if userRankRatings
        for seasonRankRating in userRankRatings
          fbSeasonStartAt = moment.utc(seasonRankRating.season_starting_at).valueOf()
          fbUserRatingData =
            ladder_position: seasonRankRating.ladder_position
            updated_at: moment.utc(seasonRankRating.updated_at).valueOf()
          allPromises.push FirebasePromises.set(@.fbRootRef.child('user-ladder-position').child(fbSeasonStartAt).child(userId),fbUserRatingData)

      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('spirit-orb-total').child(SDK.CardSet.Bloodborn),@.userData.total_orb_count_set_3))
      allPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(userId).child('spirit-orb-total').child(SDK.CardSet.Unity),@.userData.total_orb_count_set_4))

      # Codex inventory
      for row in userBossesDefeated
        # Place data in fb for storage after the transaction has completed
        fbDefeatedBossData =
          boss_id: row.boss_id
          boss_event_id: row.boss_event_id
          defeated_at: moment.utc(row.defeated_at).valueOf()
        allPromises.push FirebasePromises.set(@.fbRootRef.child("user-bosses-defeated").child(userId).child(row.boss_id),fbDefeatedBossData)

      userRiftRunsFBData = {}
      for userRiftRun in userRiftRuns
        fbRiftRunData = DataAccessHelpers.restifyData(userRiftRun)
        # TODO: any data need to be trimmed here?
        userRiftRunsFBData[fbRiftRunData.ticket_id] = fbRiftRunData
      if userRiftRuns? and userRiftRuns.length != 0
        allPromises.push FirebasePromises.set(@.fbRootRef.child("user-rift-runs").child(userId),userRiftRunsFBData)
      else
        allPromises.push FirebasePromises.remove(@.fbRootRef.child("user-rift-runs").child(userId))

      return Promise.all(allPromises)

    .then ()->

      Logger.module("UsersModule").timeEnd "_syncUserFromSQLToFirebase() -> #{userId} + buddies:#{shouldSyncBuddyList}".green
      return Promise.all([
        knex("users").where('id',userId).update({ synced_firebase_at:moment().utc().toDate() }),
        FirebasePromises.set(@.fbRootRef.child('users').child(userId).child('tx_counter').child('count'),@.userData.tx_count)
      ])

  @_syncUserFromFirebaseToSQL: (srcRootRef,userId,forceResync=false) ->
    Logger.module("UsersModule").time "_syncUserFromFirebaseToSQL() -> #{userId} done".green

    this_obj = {}

    return knex.first('id').from('users').where('id',userId)
    .bind this_obj
    .then (userRow)->

      if userRow
        if not forceResync
          throw new Errors.AlreadyExistsError("This user has already been synced")
        else
          # TODO: delete old user data

      fbRootRef = srcRootRef

      Logger.module("UsersModule").time "_syncUserFromFirebaseToSQL() -> firebase data loaded"

      return Promise.all([
        FirebasePromises.once(fbRootRef.child("users").child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-inventory').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-quests').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-ranking').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-decks').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-games').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-progression').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-faction-progression').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-challenge-progression').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-arena-run').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-news').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-matchmaking-errors').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-stats').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-rewards').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-receipts').child(userId),"value"),
        FirebasePromises.once(fbRootRef.child('user-new-player-progression').child(userId).child("modules"),"value"),
        FirebasePromises.once(fbRootRef.child('user-achievements').child(userId),"value"),
        # FirebasePromises.once(fbRootRef.child('user-logs').child(userId),"value"),
        # FirebasePromises.once(fbRootRef.child('user-aggregates').child(userId),"value"),
      ])

    .spread (user,inventory,quests,ranking,decks,games,progression,factionProgression,challengeProgression,arenaRun,news,matchmakingErrors,stats,rewards,receipts,newPlayerProgression,achievements,logs,aggregates) ->

      @.user = user.val()
      @.buddies = user.val()?.buddies
      @.inventory = inventory?.val()
      @.quests = quests?.val()
      @.ranking = ranking?.val()
      @.decks = decks?.val()
      @.games = games?.val()
      @.progression = progression?.val()
      @.factionProgression = factionProgression?.val()
      @.challengeProgression = challengeProgression?.val()
      @.arenaRun = arenaRun?.val()
      @.news = news?.val()
      @.matchmakingErrors = matchmakingErrors?.val()
      @.stats = stats?.val()
      @.rewards = rewards?.val()
      @.receipts = receipts?.val()
      # @.logs = logs?.val()
      # @.aggregates = aggregates?.val()
      @.newPlayerProgression = newPlayerProgression?.val()
      @.achievements = achievements?.val()

      @.currencyLogGold = 0
      @.currencyLogSpirit = 0

      # map the faction progression to an object
      if @.factionProgression instanceof Array
        map = {}
        for item,i in @.factionProgression
          map[i] = item
        @.factionProgression = m

      Logger.module("UsersModule").timeEnd "_syncUserFromFirebaseToSQL() -> firebase data loaded"

      # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> inventory", @.inventory
      # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> arenaRun", @.arenaRun

      toPgDate = (timestamp)->
        if timestamp
          moment.utc(timestamp).toDate()
        else
          return null

      return knex.transaction (trx)=>

        userData =
          id:userId
          username:@.user.username.toLowerCase()
          invite_code:@.authUser.inviteCode
          created_at: toPgDate(@.user.createdAt)
          updated_at: toPgDate(@.user.updatedAt)
          last_session_at: toPgDate(@.user.presence?.began)
          ltv:@.user.ltv || 0
          portrait_id: @.user.presence?.portrait_id
          card_back_id: @.user.presence?.card_back_id

        if @.buddies
          userData.buddy_count = _.keys(@.buddies).length

        if @.ranking?.current
          userData.rank = @.ranking.current.rank
          userData.rank_created_at = toPgDate(@.ranking.current.created_at)
          userData.rank_starting_at = toPgDate(@.ranking.current.starting_at)
          userData.rank_stars = @.ranking.current.stars
          userData.rank_stars_required = @.ranking.current.stars_required
          userData.rank_updated_at = toPgDate(@.ranking.current.updated_at)
          userData.rank_win_streak = @.ranking.current.win_streak
          userData.rank_top_rank = @.ranking.current.top_rank
          userData.rank_is_unread = @.ranking.current.is_unread || false
          userData.top_rank = @.ranking.top?.rank
          userData.top_rank_starting_at = toPgDate(@.ranking.top?.starting_at)
          userData.top_rank_updated_at = toPgDate(@.ranking.top?.updated_at)

        if @.inventory?.wallet

          total_pack_count = _.keys(@.inventory?["booster-packs"]).length + _.keys(@.inventory?["used-booster-packs"]).length
          total_ticket_count = _.keys(@.inventory?["arena-tickets"]).length + _.keys(@.inventory?["arena-tickets-used"]).length
          total_gold_spent = total_pack_count*100 + total_ticket_count*150

          userData.wallet_gold = @.inventory?.wallet.gold_amount || 0
          userData.wallet_spirit = @.inventory?.wallet.spirit_amount || 0
          userData.wallet_updated_at = toPgDate(@.inventory?.wallet.updated_at) || null
          userData.total_gold_earned = userData.wallet_gold + total_gold_spent

        if @.quests?.daily?.current
          userData.daily_quests_generated_at = toPgDate(@.quests?.daily?.current?.generated_at)
          userData.daily_quests_updated_at = toPgDate(@.quests?.daily?.current?.updated_at)

        userData.top_gauntlet_win_count = null

        # top arena win count
        if @.arenaRun?.history?
          # console.log("history")
          for key,run of @.arenaRun?.history
            # console.log("run #{run.win_count}")
            if run.win_count > userData.top_gauntlet_win_count
              # console.log("run set")
              userData.top_gauntlet_win_count = run.win_count

        # top arena win count
        # console.log("current run #{@.arenaRun?.current?.win_count}")
        if @.arenaRun?.current?.win_count > userData.top_gauntlet_win_count
          # console.log("run set")
          userData.top_gauntlet_win_count = @.arenaRun?.current?.win_count

        # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving user data."

        @.userData = userData

        return trx.insert(userData).into("users")

        .bind this_obj
        .then () -> #buddies

          inserts = []

          if @.buddies

            # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving buddy list."

            for key,obj of @.buddies

              inserts.push trx.insert(
                user_id:userId
                buddy_id:key
                created_at:toPgDate(obj.createdAt || moment().utc().valueOf())
              ).into("user_buddies")

          return Promise.all(inserts)

        .then ()-> #rank

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving rank data."

          inserts = []

          # Mark seasons older than this as read, newer are marked as unread
          beginUnreadSeasonsTimestamp = moment("9-1-2015 +0000", "MM-DD-YYYY Z").utc().valueOf()

          if @.ranking?.history?
            for key,historyRank of @.ranking?.history

              isUnread = historyRank.starting_at >= beginUnreadSeasonsTimestamp

              if isUnread
                rewardsClaimedAt = null
                rewardIds = null
              else
                rewardsClaimedAt = toPgDate(moment.utc().valueOf())
                rewardIds = []


              # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving history rank ${moment.utc(historyRank.starting_at).format()}."

              inserts.push trx.insert(
                user_id:userId
                created_at:toPgDate(historyRank.created_at)
                updated_at:toPgDate(historyRank.updated_at)
                starting_at:toPgDate(historyRank.starting_at)
                rank:historyRank.rank
                stars:historyRank.stars
                stars_required:historyRank.stars_required
                win_streak:historyRank.win_streak
                top_rank: if historyRank.top_rank? then historyRank.top_rank else historyRank.rank
                reward_ids:rewardIds
                rewards_claimed_at:rewardsClaimedAt
                is_unread:isUnread
              ).into("user_rank_history")

          return Promise.all(inserts)

        .then ()-> #quests

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving quest data."

          inserts = []

          if @.quests?.daily?.current?.quests?
            for key,quest of @.quests?.daily?.current?.quests

              # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving CURRENT quest at slot #{key}."

              inserts.push trx.insert(
                user_id:        userId
                quest_slot_index:    key
                quest_type_id:      quest.q_id
                begin_at:        toPgDate(quest.begin_at)
                created_at:        toPgDate(quest.created_at)
                updated_at:        toPgDate(quest.updated_at)
                mulliganed_at:      toPgDate(quest.mulliganed_at)
                progressed_by_game_ids:  quest.progressedBy
                # completion_count:  quest.completion_count
                gold:          quest.gold
                progress:        quest.progress
                params:          quest.params
                is_unread:        quest.is_unread
                read_at:        if quest.is_unread then moment().utc().toDate() else null
              ).into("user_quests")

          if @.quests?.daily?.completed?
            for key,quest of @.quests?.daily?.completed

              # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving completed quest #{key}."

              inserts.push trx.insert(
                id:            key
                user_id:        userId
                quest_type_id:      quest.q_id
                begin_at:        toPgDate(quest.begin_at)
                created_at:        toPgDate(quest.created_at)
                updated_at:        toPgDate(quest.updated_at)
                completed_at:      toPgDate(quest.completed_at)
                mulliganed_at:      toPgDate(quest.mulliganed_at)
                progressed_by_game_ids:  quest.progressedBy
                # completion_count:  quest.completion_count
                gold:          quest.gold
                progress:        quest.progress
                params:          quest.params
                is_unread:        quest.is_unread
                read_at:        if quest.is_unread then moment().utc().toDate() else null
              ).into("user_quests_complete")

              inserts.push trx.insert(
                id:              generatePushId()
                user_id:          userId
                reward_category:      "quest"
                source_id:          key
                quest_type_id:        quest.q_id
                gold:            quest.gold
                created_at:          toPgDate(quest.completed_at)
                is_unread:          false
                read_at:          toPgDate(quest.completed_at)
              ).into("user_rewards")

              inserts.push trx.insert(
                id:          generatePushId()
                user_id:      userId
                gold:        quest.gold
                memo:        'quest'
                created_at:      toPgDate(quest.completed_at)
              ).into("user_currency_log")

              @.currencyLogGold += quest.gold

          return Promise.all(inserts)

        .then ()-> #arena runs

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving gauntlet data."

          inserts = []

          if @.arenaRun?.current

            run = @.arenaRun?.current

            rewardIds = null
            if run["rewards"]
              rewardIds = []
              for reward in run["rewards"]
                rewardId = generatePushId()
                inserts.push trx.insert(
                  id:              rewardId
                  user_id:          userId
                  reward_category:      "gauntlet run"
                  source_id:          run.ticket_id
                  gold:            reward.gold
                  spirit:            reward.spirit
                  spirit_orbs:        reward.booster_packs
                  cards:            reward.cards
                  gauntlet_tickets:      reward.arena_tickets
                  created_at:          toPgDate(run.ended_at)
                  is_unread:          false
                  read_at:          toPgDate(run.ended_at)
                ).into("user_rewards")
                rewardIds.push rewardId

            inserts.push trx.insert(
              user_id:      userId
              ticket_id:      run.ticket_id
              win_count:      run.win_count || 0
              loss_count:      run.loss_count || 0
              draw_count:      run.draw_count || 0
              is_complete:    run.is_complete || false
              created_at:      toPgDate(run.created_at)
              updated_at:      toPgDate(run.updated_at)
              started_at:      toPgDate(run.started_at)
              completed_at:    toPgDate(run.completed_at)
              ended_at:      toPgDate(run.ended_at)
              rewards_claimed_at:  toPgDate(run.rewards_claimed_at)
              faction_choices:  run.faction_choices
              faction_id:      run.faction_id
              deck:        run.deck
              card_choices:    run.card_choices
              reward_ids:      rewardIds
            ).into("user_gauntlet_run")

          for key,run of @.arenaRun?.history

            rewardIds = []

            for reward in run["rewards"]
              cards = null
              if reward.card_id
                cards = [reward.card_id]

              rewardId = generatePushId()
              inserts.push trx.insert(
                id:              rewardId
                user_id:          userId
                reward_category:      "gauntlet run"
                source_id:          run.ticket_id
                gold:            reward.gold
                spirit:            reward.spirit
                spirit_orbs:        reward.booster_packs
                cards:            cards
                gauntlet_tickets:      reward.arena_tickets
                created_at:          toPgDate(run.rewards_claimed_at)
                is_unread:          false
                read_at:          toPgDate(run.rewards_claimed_at)
              ).into("user_rewards")
              rewardIds.push rewardId

              if reward.gold or reward.spirit
                inserts.push trx.insert(
                  id:          generatePushId()
                  user_id:      userId
                  gold:        reward.gold || 0
                  spirit:        reward.spirit || 0
                  memo:        'gauntlet'
                  created_at:      toPgDate(run.rewards_claimed_at)
                ).into("user_currency_log")

                @.currencyLogGold += reward.gold || 0
                @.currencyLogSpirit += reward.spirit || 0

            inserts.push trx.insert(
              id:          run.ticket_id
              user_id:      userId
              win_count:      run.win_count || 0
              loss_count:      run.loss_count || 0
              draw_count:      run.draw_count || 0
              is_complete:    run.is_complete || false
              created_at:      toPgDate(run.created_at)
              updated_at:      toPgDate(run.updated_at)
              started_at:      toPgDate(run.started_at)
              completed_at:    toPgDate(run.completed_at)
              ended_at:      toPgDate(run.ended_at)
              rewards_claimed_at:  toPgDate(run.rewards_claimed_at)
              faction_choices:  run.faction_choices
              faction_id:      run.faction_id
              deck:        run.deck
              card_choices:    run.card_choices
              reward_ids:      rewardIds
            ).into("user_gauntlet_run_complete")

          return Promise.all(inserts) #

        .then ()-> #inventory packs/tickets

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving inventory data."

          inserts = []

          boosterPackGoldDelta = -100
          gauntletTicketGoldDelta = -150

          for key,pack of @.inventory?["booster-packs"]
            inserts.push trx.insert(
              id:          key
              user_id:      userId
              transaction_type:  pack.transaction_type
              transaction_id:    pack.charge_id || pack.ticket_id
              created_at:      toPgDate(pack.created_at)
              is_unread:      false
            ).into("user_spirit_orbs")

            if pack.transaction_type == 'soft'
              inserts.push trx.insert(
                id:          generatePushId()
                user_id:      userId
                gold:        boosterPackGoldDelta
                memo:        "spirit orb #{key}"
                created_at:      toPgDate(pack.created_at)
              ).into("user_currency_log")

              @.currencyLogGold += boosterPackGoldDelta

          for key,pack of @.inventory?["used-booster-packs"]
            inserts.push trx.insert(
              id:          key
              user_id:      userId
              transaction_type:  pack.transaction_type
              transaction_id:    pack.charge_id || pack.ticket_id
              created_at:      toPgDate(pack.created_at)
              opened_at:      toPgDate(pack.opened_at)
              cards:        pack.cards
            ).into("user_spirit_orbs_opened")

            if pack.transaction_type == 'soft'
              inserts.push trx.insert(
                id:          generatePushId()
                user_id:      userId
                gold:        boosterPackGoldDelta
                memo:        "spirit orb #{key}"
                created_at:      toPgDate(pack.created_at)
              ).into("user_currency_log")

              @.currencyLogGold += boosterPackGoldDelta

          for key,ticket of @.inventory?["arena-tickets"]
            inserts.push trx.insert(
              id:          key
              user_id:      userId
              transaction_type:  ticket.transaction_type
              transaction_id:    ticket.transaction_id
              created_at:      toPgDate(ticket.created_at)
              is_unread:      ticket.is_unread || false
            ).into("user_gauntlet_tickets")

            if ticket.transaction_type == 'soft'
              inserts.push trx.insert(
                id:          generatePushId()
                user_id:      userId
                gold:        gauntletTicketGoldDelta
                memo:        "gauntlet ticket #{key}"
                created_at:      toPgDate(ticket.created_at)
              ).into("user_currency_log")

              @.currencyLogGold += gauntletTicketGoldDelta

          for key,ticket of @.inventory?["used-arena-tickets"]
            inserts.push trx.insert(
              id:          key
              user_id:      userId
              transaction_type:  ticket.transaction_type
              transaction_id:    ticket.transaction_id
              created_at:      toPgDate(ticket.created_at)
              used_at:      toPgDate(ticket.used_at)
            ).into("user_gauntlet_tickets_used")

            if ticket.transaction_type == 'soft'
              inserts.push trx.insert(
                id:          generatePushId()
                user_id:      userId
                gold:        gauntletTicketGoldDelta
                memo:        "gauntlet ticket #{key}"
                created_at:      toPgDate(ticket.created_at)
              ).into("user_currency_log")

              @.currencyLogGold += gauntletTicketGoldDelta

          return Promise.all(inserts)

        .then ()-> #receipts

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving receipt data."

          inserts = []

          for key,charge of @.receipts

            amount = 0
            currency = 'usd'

            if charge.payment_gross || charge.mc_gross
              gross = charge.payment_gross || charge.mc_gross
              amount = Math.round(parseFloat(gross)*100)
              currency = charge.mc_currency?.toLowerCase()
            else
              amount = charge.amount
              currency = charge.currency

            chargeCreated = charge.created
            if !charge.created? && charge.payment_date?
              chargeCreated = Date.parse(charge.payment_date) / 1000

            inserts.push trx.insert(
              charge_id:      key
              user_id:      userId
              amount:        amount
              currency:      currency
              charge_json:    charge
              created_at:      toPgDate(chargeCreated*1000)
            ).into("user_charges")

          return Promise.all(inserts)

        .then ()-> #decks

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving decks data."

          inserts = []

          for key,deck of @.decks

            if not deck.factionId?
              Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} skipping deck #{key} due to no faction id.".red
              continue

            inserts.push trx.insert(
              id:          key
              user_id:      userId
              name:        deck.name
              faction_id:      deck.factionId
              spell_count:    deck.spell_count
              minion_count:    deck.minion_count
              artifact_count:    deck.artifact_count
              color_code:    deck.color_code
              card_back_id:    deck.card_back_id
              cards:        deck.cards
              created_at:      toPgDate(deck.created_at)
              updated_at:      toPgDate(deck.last_edited_at)
            ).into("user_decks")

          return Promise.all(inserts)

        .then ()-> #games

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving games data.".cyan

          inserts = []

          gameCounters = {}
          factionGameCounters = {}
          seasonGameCounters = {}

          for key,game of @.games

            if game.gameType == 'arena'
              game.gameType = SDK.GameType.Gauntlet

            inserts.push trx.insert(
              user_id:        userId
              game_id:        key
              game_type:        game.gameType
              game_server:      game.gameServer
              is_player_1:      game.isPlayer1
              is_scored:        !game.isUnscored
              is_winner:        game.isWinner || false
              is_draw:        if not game.isWinner? then true else false
              faction_id:        game.factionId
              general_id:        game.generalId
              opponent_id:      game.opponentId
              opponent_faction_id:  game.opponentFactionId
              opponent_general_id:  game.opponentGeneralId
              opponent_username:    game.opponentName
              # deck_cards:      game.
              deck_id:        game.deckId
              game_version:      game.gameVersion
              # rewards:        game.
              status:          game.status
              created_at:        toPgDate(game.createdAt)
              ended_at:        toPgDate(game.updatedAt)
              updated_at:        toPgDate(game.updatedAt)
            ).into("user_games")

            if game.gameType? and game.factionId?
              #
              counter = DataAccessHelpers.updateCounterWithGameOutcome(gameCounters[game.gameType],game.isWinner,game.isWinner == null,game.isUnscored)
              counter.user_id = userId
              counter.game_type = game.gameType
              counter.updated_at = toPgDate(game.createdAt)
              gameCounters[game.gameType] = counter

              #
              factionGameCounters[game.gameType] ?= {}
              factionCounter = DataAccessHelpers.updateCounterWithGameOutcome(factionGameCounters[game.gameType][game.factionId],game.isWinner,game.isWinner == null,game.isUnscored)
              factionCounter.user_id = userId
              factionCounter.faction_id = game.factionId
              factionCounter.game_type = game.gameType
              factionCounter.updated_at = toPgDate(game.createdAt)
              factionGameCounters[game.gameType][game.factionId] = factionCounter

              #
              seasonGameCounters[game.gameType] ?= {}
              seasonStartingAt = moment.utc(game.createdAt).startOf('month')
              seasonCounter = DataAccessHelpers.updateCounterWithGameOutcome(seasonGameCounters[game.gameType][seasonStartingAt.valueOf()],game.isWinner,game.isWinner == null,game.isUnscored)
              seasonCounter.user_id = userId
              seasonCounter.season_starting_at = seasonStartingAt.toDate()
              seasonCounter.game_type = game.gameType
              seasonCounter.updated_at = toPgDate(game.createdAt)
              seasonGameCounters[game.gameType][seasonStartingAt.valueOf()] = seasonCounter

          for key,counter of gameCounters
            inserts.push trx.insert(counter).into("user_game_counters")

          for key,factions of factionGameCounters
            for key,counter of factions
              inserts.push trx.insert(counter).into("user_game_faction_counters")

          for key,seasons of seasonGameCounters
            for key,counter of seasons
              inserts.push trx.insert(counter).into("user_game_season_counters")

          return Promise.all(inserts)

        .then ()-> #faction progression

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving faction progression data.".cyan

          inserts = []

          if not @.factionProgression
            return

          for factionId,progression of @.factionProgression

            # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> saving faction #{factionId} data."

            if progression?.stats
              stats = progression.stats
              inserts.push trx.insert(
                user_id:        userId
                faction_id:        factionId
                xp:            stats.xp || 0
                xp_earned:        stats.xp_earned
                level:          stats.level || 0
                game_count:        stats.game_count || 0
                win_count:        stats.win_count || 0
                draw_count:        stats.draw_count || 0
                loss_count:        stats.loss_count || stats.game_count - stats.win_count || 0
                unscored_count:      stats.unscored_count || 0
                created_at:        toPgDate(stats.updated_at)
                updated_at:        toPgDate(stats.updated_at)
                last_game_id:      stats.game_id
              ).into("user_faction_progression")

            xpSoFar = 0

            for key,progress of progression?.progress
              inserts.push trx.insert(
                user_id:        userId
                faction_id:        factionId
                game_id:        key
                xp_earned:        progress.xp_earned
                is_winner:        progress.is_winner || false
                is_draw:        if not progress.is_winner? then true else false
                is_scored:        !progress.is_unscored
                created_at:        toPgDate(progress.created_at)
              ).into("user_faction_progression_events")

              inserts.push trx('user_games').where({'user_id':userId,'game_id':key}).update({
                faction_xp:xpSoFar
                faction_xp_earned:progress.xp_earned
              })

              xpSoFar += progress.xp_earned

            # faction progression rewards
            for key,reward of progression?["rewards"]

              cards = null
              if reward.cards
                cards = _.reduce(reward.cards,(memo,card)->
                  for i in [1..card.count]
                    memo.push(card.id)
                  return memo
                ,[])

              # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> saving reward..."
              factionName = SDK.FactionFactory.factionForIdentifier(factionId).devName

              inserts.push trx.insert(
                id:              generatePushId()
                game_id:          key
                user_id:          userId
                reward_category:      "faction xp"
                reward_type:        "#{factionName} L#{reward.level}"
                gold:            reward.gold
                spirit:            reward.spirit
                spirit_orbs:        reward.booster_packs
                created_at:          toPgDate(reward.created_at)
                cards:            cards
                cosmetics:          reward.emotes
                is_unread:          false
                read_at:          moment().utc().toDate()
              ).into("user_rewards")

          return Promise.all(inserts)

        .then ()-> #cards collection

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving card collection data.".cyan

          inserts = []

          cardLog = []
          cardCounts = {}

          # faction xp cards
          if @.factionProgression
            # faction XP cards
            for factionId,progression of @.factionProgression

              if progression?
                factionName = SDK.FactionFactory.factionForIdentifier(factionId).devName

                # faction progression rewards
                for key,reward of progression?["rewards"]
                  if reward.cards
                    cards = _.reduce(reward.cards,(memo,card)->
                      for i in [1..card.count]
                        memo.push(card.id)
                      return memo
                    ,[])

                    for cardId in cards

                      # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> earned #{cardId} via faction XP."

                      cardLog.push
                        id:            generatePushId()
                        user_id:        userId
                        card_id:        cardId
                        is_credit:        true
                        source_type:      "faction xp"
                        memo:          "#{factionName} L#{reward.level}"
                        created_at:        toPgDate(reward.created_at)

                      cardCounts[cardId] ?=
                        user_id:        userId
                        card_id:        cardId
                        count:          0
                        created_at:        toPgDate(reward.created_at)
                        is_unread:        false

                      cardCounts[cardId].count += 1
                    cardCounts[cardId].updated_at = toPgDate(reward.created_at)

          # gauntlet reward cards
          allRuns = _.values(@.arenaRun?.history) || []
          if @.arenaRun?.current?.rewards
            allRuns.push @.arenaRun?.current

          for run in allRuns
            for reward in run.rewards
              if reward.card_id
                cardId = reward.card_id

                # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> earned #{cardId} via gauntlet."

                cardLog.push
                  id:            generatePushId()
                  user_id:        userId
                  card_id:        cardId
                  is_credit:        true
                  source_type:      "gauntlet"
                  source_id:        run.ticket_id
                  created_at:        toPgDate(run.rewards_claimed_at)

                cardCounts[cardId] ?=
                  user_id:        userId
                  card_id:        cardId
                  count:          0
                  created_at:        toPgDate(run.rewards_claimed_at)
                  is_unread:        false

                cardCounts[cardId].count += 1
                cardCounts[cardId].updated_at = toPgDate(run.rewards_claimed_at)

          # achievement reward cards
          if @.achievements?.completed
            for achievementId,achievementData of @.achievements.completed
              if achievementData.rewards.card_ids
                for cardId in achievementData.rewards.card_ids
                  # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> earned #{cardId} via achievement."

                  cardLog.push
                    id:            generatePushId()
                    user_id:        userId
                    card_id:        cardId
                    is_credit:        true
                    source_type:      "achievement"
                    source_id:        achievementId
                    created_at:        toPgDate(achievementData.completed_at)

                  cardCounts[cardId] ?=
                    user_id:        userId
                    card_id:        cardId
                    count:          0
                    created_at:        toPgDate(achievementData.completed_at)
                    is_unread:        false

                  cardCounts[cardId].count += 1
                  cardCounts[cardId].updated_at = toPgDate(achievementData.completed_at)

          # booster cards
          for packId,pack of @.inventory?["used-booster-packs"]

            # console.log "PACK: #{packId}".red
            # console.log "CARDS: #{packId}",pack.cards

            cards = pack.cards
            for cardId in cards

              # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> earned #{cardId} via packs."

              cardLog.push
                id:            generatePushId()
                user_id:        userId
                card_id:        cardId
                is_credit:        true
                source_type:      "spirit orb"
                source_id:        packId
                created_at:        toPgDate(pack.opened_at)

              cardCounts[cardId] ?=
                user_id:        userId
                card_id:        cardId
                count:          0
                created_at:        toPgDate(pack.opened_at)
                is_unread:        false

              cardCounts[cardId].count += 1
              cardCounts[cardId].updated_at = toPgDate(pack.opened_at)

          # all other cards
          if @.inventory?["card-collection"]
            delete @.inventory?["card-collection"].tx_id

          # before going through actual collection, mark all cards earned so far but missing from collection as disenchanted, and update its card count
          for cardId,card of cardCounts
            if not @.inventory?['card-collection'][cardId]

              Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> missing card #{cardId} - marking as disenchanted."

              for i in [1..card.count]
                cardLog.push
                  id:            generatePushId()
                  user_id:        userId
                  card_id:        cardId
                  is_credit:        false
                  source_type:      "crafting"
                  created_at:        moment().utc().toDate()

              # Update card count to 0
              card.count = 0

          #... ok process actual collection
          for cardId,card of @.inventory?["card-collection"]

            # if there is an "undefined" in the card count, just feel free to skip
            if not card.count?
              continue

            cardCounts[cardId] ?=
              user_id:        userId
              card_id:        cardId
              count:          0
              created_at:        moment().utc().toDate()

            countSoFar = cardCounts[cardId]?.count || 0
            countDelta = card.count - countSoFar

            # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> card #{cardId}. count = #{countSoFar}. collection count = #{card.count}".blue


            if countDelta > 0

              for i in [1..countDelta]

                # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> un-accounted for card #{cardId} - marking as crafted."

                cardLog.push
                  id:            generatePushId()
                  user_id:        userId
                  card_id:        cardId
                  is_credit:        true
                  source_type:      "crafting"
                  created_at:        moment().utc().toDate()

            else if countDelta < 0

              for i in [1..Math.abs(countDelta)]

                # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> missing card #{cardId} - marking as disenchanted."

                cardLog.push
                  id:            generatePushId()
                  user_id:        userId
                  card_id:        cardId
                  is_credit:        false
                  source_type:      "crafting"
                  created_at:        moment().utc().toDate()

            # set the correct final count
            cardCounts[cardId].count = card.count
            cardCounts[cardId].is_unread = card.is_unread
            cardCounts[cardId].is_new = card.is_new

          for log in cardLog
            inserts.push trx.insert(log).into("user_card_log")

          for id,card of cardCounts
            if card.count
              inserts.push trx.insert(card).into("user_cards")

          if @.inventory?["card-collection"]
            inserts.push trx.insert(
              user_id:userId
              cards:@.inventory?["card-collection"]
              created_at:moment().utc().toDate()
            ).into("user_card_collection")

          return Promise.all(inserts)

        .then ()-> #progression

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} progression data.".cyan

          inserts = []

          if @.progression?["game-counter"]
            stats = @.progression?["game-counter"]
            inserts.push trx.insert(
              user_id:          userId
              game_count:          stats.game_count || 0
              win_count:          stats.win_count || 0
              win_streak:          stats.win_streak || 0
              loss_count:          stats.loss_count || 0
              draw_count:          stats.draw_count || 0
              unscored_count:        stats.unscored_count || 0
              updated_at:          toPgDate(stats.updated_at)
              last_game_id:        stats.last_game_id
              last_awarded_game_count:  stats.last_awarded_game_count
              last_awarded_win_count:    stats.last_awarded_win_count
              last_awarded_win_count_at:  toPgDate(stats.last_awarded_win_count_at)
              last_daily_win_at:      toPgDate(stats.last_daily_win_at)
              last_win_at:        toPgDate(stats.last_win_at)
              win_awards_last_maxed_at:  toPgDate(stats.win_awards_last_maxed_at)
              play_awards_last_maxed_at:  toPgDate(stats.play_awards_last_maxed_at)
            ).into("user_progression")

          for key,day of @.progression?["game-counter-days"]
            inserts.push trx.insert(
              user_id:          userId
              date:            key
              game_count:          day.game_count || 0
              win_count:          day.win_count || 0
              win_streak:          day.win_streak || 0
              loss_count:          day.loss_count || 0
              draw_count:          day.draw_count || 0
              unscored_count:      day.unscored_count || 0
            ).into("user_progression_days")

          # daily win / 4-game count / etc.
          for key,reward of @.progression?["game-counter-rewards"]
            inserts.push trx.insert(
              id:              key
              user_id:          userId
              reward_category:      "game counter"
              reward_type:        reward.type
              gold:            reward.gold_amount
              spirit:            reward.spirit_amount
              cores:            reward.cores_amount
              created_at:          toPgDate(reward.created_at)
              is_unread:          reward.is_unread
              read_at:          moment().utc().toDate()
            ).into("user_rewards")

            inserts.push trx.insert(
              id:          generatePushId()
              user_id:      userId
              gold:        reward.gold_amount
              memo:        reward.type
              created_at:      toPgDate(reward.created_at)
            ).into("user_currency_log")

            @.currencyLogGold += reward.gold_amount


          return Promise.all(inserts)

        .then ()-> #challenges

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving challenges data.".cyan

          inserts = []

          # daily quest rewards
          for challengeType,challenge of @.challengeProgression

            goldReward = SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType)

            allPromises = []
            rewardIds = null

            if goldReward and challenge.completed_at

              rewardIds = []

              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"challenge"
                reward_type:challengeType
                gold:goldReward
                created_at:toPgDate(challenge.completed_at)
                is_unread:false
              }

              rewardIds.push rewardData.id

              # add the promise to our list of reward promises
              inserts.push(trx("user_rewards").insert(rewardData))

              inserts.push trx.insert(
                id:          generatePushId()
                user_id:      userId
                gold:        goldReward
                memo:        'challenge'
                created_at:      toPgDate(challenge.completed_at)
              ).into("user_currency_log")

              @.currencyLogGold += goldReward

            inserts.push trx.insert(
              user_id:          userId
              challenge_id:        challengeType
              completed_at:        if challenge.completed_at then toPgDate(challenge.completed_at) else null
              last_attempted_at:      toPgDate(challenge.last_attempted_at)
              is_unread:          false
              reward_ids:          rewardIds
            ).into("user_challenges")

          return Promise.all(inserts)

        .then ()-> #new player progression

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving new player progression data.".cyan

          inserts = []

          # daily quest rewards
          for moduleName,data of @.newPlayerProgression

            inserts.push trx.insert(
              user_id:          userId
              module_name:        moduleName
              stage:            data.stage
              updated_at:          toPgDate(data.updated_at)
              is_unread:          false
            ).into("user_new_player_progression")

          return Promise.all(inserts)

        .then ()-> #emotes

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving emotes.".cyan

          inserts = []

          # # daily quest rewards
          # if @.inventory?.emotes
          #   for emoteId,data of @.inventory?.emotes
          #
          #     inserts.push trx.insert(
          #       user_id:          userId
          #       emote_id:          emoteId
          #       created_at:          toPgDate(data.created_at)
          #       transaction_type:      data.transaction_type
          #       is_unread:          false
          #     ).into("user_emotes")


          return Promise.all(inserts)

        .then ()-> #achievements

          # Logger.module("UsersModule").log "_syncUserFromFirebaseToSQL() -> #{userId} saving achievements.".cyan

          inserts = []

          # ...
          if @.achievements?.completed
            for id,data of @.achievements.completed

              achievement = SDK.AchievementsFactory.achievementForIdentifier(id)
              rewardId = generatePushId()

              inserts.push trx.insert(
                user_id:          userId
                achievement_id:        id
                created_at:          toPgDate(data.completed_at)
                completed_at:        toPgDate(data.completed_at)
                progress:          achievement.progressRequired
                progress_required:      achievement.progressRequired
                reward_ids:          [rewardId]
                is_unread:          false
              ).into("user_achievements")

              # set up reward data
              rewardData = {
                id:            rewardId
                user_id:        userId
                reward_category:    "achievement"
                reward_type:      id
                gold:          data.rewards.gold
                spirit:          data.rewards.spirit
                spirit_orbs:      data.rewards.spirit_orb
                gauntlet_tickets:    data.rewards.gauntlet_ticket
                cards:          data.rewards.card_ids
                created_at:        toPgDate(data.completed_at)
                read_at:        toPgDate(data.completed_at)
                is_unread:false
              }

              # add the promise to our list of reward promises
              inserts.push(trx("user_rewards").insert(rewardData))

              if data.rewards.gold or data.rewards.spirit
                inserts.push trx.insert(
                  id:          generatePushId()
                  user_id:      userId
                  gold:        data.rewards.gold || 0
                  spirit:        data.rewards.spirit || 0
                  memo:        'achievement'
                  created_at:      toPgDate(data.completed_at)
                ).into("user_currency_log")

                @.currencyLogGold += data.rewards.gold || 0
                @.currencyLogSpirit += data.rewards.spirit|| 0

          # ...
          if @.achievements?.progress
            for id,data of @.achievements.progress

              if @.achievements?.completed?[id]
                continue

              achievement = SDK.AchievementsFactory.achievementForIdentifier(id)

              inserts.push trx.insert(
                user_id:          userId
                achievement_id:        id
                created_at:          toPgDate(data.updated_at)
                updated_at:          toPgDate(data.updated_at)
                progress:          data.progress
                progress_required:      achievement.progressRequired
                is_unread:          false
              ).into("user_achievements")


          return Promise.all(inserts)

        .then ()-> #rebuild LTV

          amount = 0
          purchase_count = 0
          last_purchase_at = 0

          for key,charge of @.receipts

            purchase_count += 1

            if charge.created and charge.created > last_purchase_at
              last_purchase_at = charge.created

            if charge.payment_date
              payment_timestamp = moment(charge.payment_date).utc().valueOf()
              if payment_timestamp > last_purchase_at
                last_purchase_at = payment_timestamp

            if charge.payment_gross || charge.mc_gross
              gross = charge.payment_gross || charge.mc_gross
              amount += Math.round(parseFloat(gross)*100)
            else
              amount += charge.amount

          # set correct LTV based on all transactions
          return trx("users").where('id',userId).update(
            'ltv':        amount
            'purchase_count':  purchase_count
            'last_purchase_at':  moment(last_purchase_at).utc().toDate()
          )

        .then ()-> # Handle currency log mismatch
          userWalletGold = @.inventory?.wallet.gold_amount || 0
          userWalletSpirit = @.inventory?.wallet.spirit_amount || 0
          if userWalletGold != @.currencyLogGold || userWalletSpirit != @.currencyLogSpirit
            goldDelta = userWalletGold - @.currencyLogGold
            spiritDelta = userWalletSpirit - @.currencyLogSpirit
            return trx.insert(
              id:          generatePushId()
              user_id:      userId
              gold:        goldDelta || null
              spirit:        spiritDelta || null
              memo:        'sql migration mismatch'
              created_at:      toPgDate(moment().utc().valueOf())
            ).into("user_currency_log")
          else
            return Promise.resolve()

    .then ()->

      Logger.module("UsersModule").timeEnd "_syncUserFromFirebaseToSQL() -> #{userId} done".green

      @.userData.portrait_id = @.user.presence?.portrait_id || null
      @.userData.card_back_id = @.user.presence?.card_back_id || null

      return @.userData


module.exports = SyncModule
