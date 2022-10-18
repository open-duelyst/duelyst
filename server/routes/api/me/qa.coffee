express = require 'express'
_ = require 'underscore'
Promise = require 'bluebird'
FirebasePromises = require '../../../lib/firebase_promises.coffee'
DuelystFirebase = require '../../../lib/duelyst_firebase_module'
moment = require 'moment'
validator = require 'validator'
# lib Modules
UsersModule = require '../../../lib/data_access/users'
ReferralsModule = require '../../../lib/data_access/referrals'
RiftModule = require '../../../lib/data_access/rift'
InventoryModule = require '../../../lib/data_access/inventory'
QuestsModule = require '../../../lib/data_access/quests.coffee'
GauntletModule = require '../../../lib/data_access/gauntlet.coffee'
CosmeticChestsModule = require '../../../lib/data_access/cosmetic_chests.coffee'
AchievementsModule = require '../../../lib/data_access/achievements.coffee'
GiftCrateModule = require '../../../lib/data_access/gift_crate.coffee'
SyncModule = require '../../../lib/data_access/sync.coffee'
RankModule = require '../../../lib/data_access/rank.coffee'
SyncModule = require '../../../lib/data_access/sync.coffee'
ShopModule = require '../../../lib/data_access/shop.coffee'
TwitchModule = require '../../../lib/data_access/twitch.coffee'
knex = require '../../../lib/data_access/knex'
DataAccessHelpers = require '../../../lib/data_access/helpers'
Logger = require '../../../../app/common/logger.coffee'
Errors = require '../../../lib/custom_errors'
# sdk
SDK = require '../../../../app/sdk.coffee'
FactionFactory = require '../../../../app/sdk/cards/factionFactory'
RankFactory = require '../../../../app/sdk/rank/rankFactory.coffee'
GiftCrateLookup = require '../../../../app/sdk/giftCrates/giftCrateLookup.coffee'
CosmeticsLookup = require '../../../../app/sdk/cosmetics/cosmeticsLookup.coffee'
GameSession = require '../../../../app/sdk/gameSession.coffee'
Redis = require '../../../redis/'
{SRankManager} = require '../../../redis/'
t = require 'tcomb-validation'
util = require 'util'

# Daily challenges
zlib     = require 'zlib'
config     = require '../../../../config/config.js'
CONFIG = require('app/common/config')
UtilsEnv = require('app/common/utils/utils_env')
generatePushId = require '../../../../app/common/generate_push_id'

{Jobs} = require '../../../redis/'

# create a S3 API client
#AWS     = require "aws-sdk"
#AWS.config.update
#  accessKeyId: config.get("s3_archive.key")
#  secretAccessKey: config.get("s3_archive.secret")
#s3 = new AWS.S3()
# Promise.promisifyAll(s3)

rankedQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked'})
router = express.Router()
Logger.module("EXPRESS").log "QA routes ACTIVE".green

router.delete '/rank/history/:season_key/rewards', (req,res,next)->
  user_id = req.user.d.id
  season_key = req.params.season_key

  if not validator.matches(season_key,/^[0-9]{4}\-[0-9]{2}/i)
    return next(new Errors.BadRequestError())

  season_starting_at = moment(season_key + " +0000", "YYYY-MM Z").utc()
  knex("user_rank_history").where({'user_id':user_id,'starting_at':season_starting_at.toDate()}).first().then (row)-> console.log "found: ",row
  knex("user_rank_history").where({'user_id':user_id,'starting_at':season_starting_at.toDate()}).update(
    rewards_claimed_at:null,
    reward_ids:null
    is_unread:true
  ).then (updateCount)->
    res.status(200).json({})

router.put '/rank/history/:season_key/top_rank', (req,res,next)->
  user_id = req.user.d.id
  season_key = req.params.season_key
  rank = req.body.rank

  if not validator.matches(season_key,/^[0-9]{4}\-[0-9]{2}/i)
    return next(new Errors.BadRequestError())

  season_starting_at = moment(season_key + " +0000", "YYYY-MM Z").utc()
  knex("user_rank_history").where({'user_id':user_id,'starting_at':season_starting_at.toDate()}).update(
    top_rank:rank,
  ).then ()->
    res.status(200).json({})

# Updates the users current rank (and top rank if appropriate)
router.put '/rank', (req,res,next)->
  MOMENT_UTC_NOW = moment().utc()

  user_id = req.user.d.id
  rank = req.body.rank

  knex("users").where({'id':user_id}).first()
  .bind {}
  .then (row)->
    @.userRow = row
    @.updateData = {
      rank: rank
      rank_stars: 0
    }
    if rank < row.rank_top_rank
      @.updateData.rank_top_rank = rank
    if rank < row.top_rank
      @.updateData.top_rank = rank

    knex("users").where({'id':user_id}).update(@.updateData)
  .then () ->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef
    FirebasePromises.set(@.fbRootRef.child('user-ranking').child(user_id).child('current'),{
      rank: parseInt(@.updateData.rank)
      stars: @.updateData.rank_stars
      stars_required: RankFactory.starsNeededToAdvanceRank(@.updateData.rank) || 0
      updated_at: MOMENT_UTC_NOW.valueOf() || null
      created_at: moment.utc(@.userRow.rank_created_at).valueOf()
      starting_at: moment.utc(@.userRow.rank_starting_at).valueOf()
    })

    if @.updateData.top_rank?
      FirebasePromises.set(@.fbRootRef.child('user-ranking').child(user_id).child('top'),{
        rank: parseInt(@.updateData.top_rank)
        updated_at: MOMENT_UTC_NOW.valueOf() || null
        created_at: moment.utc(@.userRow.rank_created_at).valueOf()
        starting_at: moment.utc(@.userRow.rank_starting_at).valueOf()
      })

  .then () ->
    # TODO: Remove rating data from fb and database if rank is not 0
    return Promise.resolve()
  .then () ->
    res.status(200).json({
      rank:@.updateData.rank
      top_rank: if @.updateData.rank_top_rank? then @.updateData.rank_top_rank else @.userRow.rank_top_rank
    })

# Updates the users current s rank rating
router.put '/rank_rating', (req,res,next)->
  MOMENT_UTC_NOW = moment().utc()
  startOfSeasonMonth = moment(MOMENT_UTC_NOW).utc().startOf('month')
  seasonStartingAt = startOfSeasonMonth.toDate()

  user_id = req.user.d.id
  rank_rating = req.body.rank_rating
  userRatingRowData =
    rating: rank_rating
    updated_at: MOMENT_UTC_NOW.toDate()

  newLadderPosition = null

  txPromise = knex.transaction (tx)->
    tx("user_rank_ratings").where('user_id',user_id).andWhere('season_starting_at',seasonStartingAt).first()
    .then (userRankRatingRow) ->
      # Update or insert
      if userRankRatingRow?
        userRatingRowData.ladder_rating = RankModule._ladderRatingForRatingAndWinCount(userRatingRowData.rating,userRankRatingRow.srank_win_count)
        return tx("user_rank_ratings").where('user_id',user_id).andWhere('season_starting_at',seasonStartingAt).update(userRatingRowData)
      else
        return tx("user_rank_ratings").insert({
          user_id: user_id
          season_starting_at: seasonStartingAt
          rating: rank_rating
          ladder_rating: RankModule._ladderRatingForRatingAndWinCount(rank_rating,0)
          top_rating: rank_rating
          rating_deviation: 200
          volatility: 0.06
          created_at: MOMENT_UTC_NOW.toDate()
          updated_at: MOMENT_UTC_NOW.toDate()
        })
    .then () ->
      return RankModule.updateAndGetUserLadderPosition(txPromise,tx,user_id,startOfSeasonMonth,MOMENT_UTC_NOW)
    .then (ladderPosition) ->
      newLadderPosition = ladderPosition
    .then tx.commit
    .catch tx.rollback
    return

  .then ()->
    res.status(200).json({ladder_position:newLadderPosition})


# Resets the users current s rank rating
router.delete '/rank_rating', (req,res,next)->
  MOMENT_UTC_NOW = moment().utc()
  startOfSeasonMonth = moment(MOMENT_UTC_NOW).utc().startOf('month')
  seasonStartingAt = startOfSeasonMonth.toDate()

  user_id = req.user.d.id

  return Promise.all([
    knex("user_rank_ratings").where('user_id',user_id).andWhere('season_starting_at',seasonStartingAt).delete(),
    knex("user_rank_ratings").where('user_id',user_id).andWhere('season_starting_at',seasonStartingAt).delete()
  ]).then ()->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    return FirebasePromises.remove(fbRootRef.child('users').child(user_id).child('presence').child('ladder_position'))
  .then () ->
    res.status(200).json({})

# Retrieves the users current s rank rating data
router.get '/rank_rating', (req,res,next)->
  MOMENT_UTC_NOW = moment().utc()
  startOfSeasonMonth = moment(MOMENT_UTC_NOW).utc().startOf('month')
  seasonStartingAt = startOfSeasonMonth.toDate()

  user_id = req.user.d.id

  user_rating_data = null

  txPromise = knex.transaction (tx)->
    RankModule.getUserRatingData(tx,user_id,MOMENT_UTC_NOW)
    .then (userRatingRow) ->
      user_rating_data = userRatingRow || {}
    .then tx.commit
    .catch tx.rollback
    return

  .then ()->
    res.status(200).json({user_rating_data:user_rating_data})

# Retrieves the users current s rank ladder position (Does not update it anywhere)
router.get '/ladder_position', (req,res,next)->
  MOMENT_UTC_NOW = moment().utc()
  startOfSeasonMonth = moment(MOMENT_UTC_NOW).utc().startOf('month')
  seasonStartingAt = startOfSeasonMonth.toDate()

  user_id = req.user.d.id

  user_ladder_position = null

  txPromise = knex.transaction (tx)->
    RankModule.getUserLadderPosition(tx,user_id,startOfSeasonMonth,MOMENT_UTC_NOW)
    .then (userLadderPosition) ->
      user_ladder_position = userLadderPosition || null
    .then tx.commit
    .catch tx.rollback
    return

  .then ()->
    res.status(200).json({user_ladder_position:user_ladder_position})

# Marks the current season as last season (so that it is ready to be cycled) and deletes last season from history if needed
router.delete '/rank/history/last', (req,res,next)->
  MOMENT_UTC_NOW = moment().utc()

  previous_season_key = moment().utc().subtract(1,'month').format("YYYY-MM")
  previous_season_starting_at = moment(previous_season_key + " +0000", "YYYY-MM Z").utc()

  current_season_key = moment().utc().format("YYYY-MM")
  current_season_starting_at = moment(current_season_key + " +0000", "YYYY-MM Z").utc()

  user_id = req.user.d.id

  Promise.all([
    knex("user_rank_history").where({'user_id':user_id,'starting_at':previous_season_starting_at.toDate()}).delete(),
    knex("user_rank_ratings").where({'user_id':user_id,'season_starting_at':previous_season_starting_at.toDate()}).delete(),
  ])
  .bind {}
  .then ()->
    @.updateUserData = {
      rank_starting_at: previous_season_starting_at.toDate()
    }

    @.updateRankRatingData = {
      season_starting_at: previous_season_starting_at.toDate()
    }

    return Promise.all([
      knex("users").where({'id':user_id}).update(@.updateUserData),
      knex("user_rank_ratings").where({'user_id':user_id,'season_starting_at':current_season_starting_at}).update(@.updateRankRatingData),
      SRankManager._removeUserFromLadder(user_id,moment.utc(current_season_starting_at))
    ])
  .then () ->
    res.status(200).json({})

router.post '/inventory/spirit', (req, res, next) ->
  user_id = req.user.d.id
  amount = req.body.amount

  txPromise = knex.transaction (tx)->
    InventoryModule.giveUserSpirit(txPromise,tx,user_id,amount,'QA gift')
    .then tx.commit
    .catch tx.rollback
    return

  .then ()->
    res.status(200).json({})

router.post '/inventory/gold', (req, res, next) ->
  user_id = req.user.d.id
  amount = req.body.amount

  txPromise = knex.transaction (tx)->
    InventoryModule.giveUserGold(txPromise,tx,user_id,amount,'QA gift')
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/inventory/premium', (req, res, next) ->
  user_id = req.user.d.id
  amount = req.body.amount

  txPromise = knex.transaction (tx)->
    if (amount > 0)
      InventoryModule.giveUserPremium(txPromise,tx,user_id,amount,'QA gift')
    else
      InventoryModule.debitPremiumFromUser(txPromise,tx,user_id,-amount,'QA charge')
  .then ()->
    res.status(200).json({})

router.post '/inventory/rift_ticket', (req, res, next) ->
  user_id = req.user.d.id

  txPromise = knex.transaction (tx)->
#    InventoryModule.giveUserGold(txPromise,tx,user_id,amount,'QA gift')
    RiftModule.addRiftTicketToUser(txPromise,tx,user_id,"qa gift",generatePushId())
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/inventory/cards', (req, res, next) ->
  user_id = req.user.d.id
  cardIds = req.body.card_ids

  if !cardIds or cardIds?.length <= 0
    return res.status(400).json({})

  txPromise = knex.transaction (tx)->
    return InventoryModule.giveUserCards(txPromise,tx,user_id,cardIds,'QA','QA','QA gift')
  .then ()->
    res.status(200).json({})

router.post '/inventory/card_set_with_spirit', (req, res, next) ->
  user_id = req.user.d.id
  cardSetId = req.body.card_set_id

  txPromise = knex.transaction (tx)->
    return InventoryModule.buyRemainingSpiritOrbsWithSpirit(user_id,cardSetId)
  .then ()->
    res.status(200).json({})
  .catch (errorMessage) ->
    res.status(500).json({message: errorMessage})

router.post '/inventory/fill_collection', (req, res, next) ->
  user_id = req.user.d.id

  txPromise = knex.transaction (tx)->
    return tx("user_card_collection").where('user_id', user_id).first()
    .then (cardCollectionRow) ->
      missingCardIds = []
      _.each(SDK.GameSession.getCardCaches().getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds(), (cardId) ->
        if cardCollectionRow? and cardCollectionRow.cards?
          cardData = cardCollectionRow.cards[cardId]
          numMissing = 0
          if (SDK.CardFactory.cardForIdentifier(cardId).getRarityId() == SDK.Rarity.Mythron)
            if !cardData?
              numMissing = 1
            else if cardData?
              numMissing = Math.max(0, 1 - cardData.count)
          else
            if !cardData?
              numMissing = CONFIG.MAX_DECK_DUPLICATES
            else if cardData?
              numMissing = Math.max(0, CONFIG.MAX_DECK_DUPLICATES - cardData.count)
        else
          # If no card collection yet then they are missing all of this card
          numMissing = CONFIG.MAX_DECK_DUPLICATES
          if (SDK.CardFactory.cardForIdentifier(cardId).getRarityId() == SDK.Rarity.Mythron)
            numMissing = 1

        if numMissing > 0
          for i in [0...numMissing]
            missingCardIds.push(cardId)
      )

      if missingCardIds.length > 0
        return InventoryModule.giveUserCards(txPromise,tx,user_id,missingCardIds,'QA','QA','QA gift')
      else
        return Promise.resolve()

  return txPromise.then ()->
    res.status(200).json({})

router.delete '/inventory/unused', (req, res, next) ->
  user_id = req.user.d.id
  this_obj = {}

  txPromise = knex.transaction (tx)->
    return tx("user_card_collection").where('user_id', user_id).first()
    .bind this_obj
    .then (cardCollectionRow) ->

      @.newCardCollection = {}
      @.ownedUnusedCards = []

      for cardId,cardCountData of cardCollectionRow.cards
        sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId)
        if (!sdkCard)
          @.ownedUnusedCards.push(cardId)
        else
          @.newCardCollection[cardId] = cardCountData

      return tx("user_card_collection").where("user_id", user_id).update({
        cards: @.newCardCollection
      })
    .then () ->
      return Promise.map(@.ownedUnusedCards,(cardId) ->
        return tx("user_cards").where("user_id",user_id).andWhere("card_id",cardId).delete()
      )
  .then ()->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then ()->
    res.status(200).json({})

router.delete '/inventory/bloodborn', (req, res, next) ->
  user_id = req.user.d.id
  this_obj = {}

  txPromise = knex.transaction (tx)->
    return tx("user_card_collection").where('user_id', user_id).first()
    .bind this_obj
    .then (cardCollectionRow) ->

      @.newCardCollection = {}
      @.ownedBloodbornCards = []

      for cardId,cardCountData of cardCollectionRow.cards
        sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId)
        if (sdkCard.getCardSetId() == SDK.CardSet.Bloodborn)
          @.ownedBloodbornCards.push(cardId)
        else
          @.newCardCollection[cardId] = cardCountData

      return tx("user_card_collection").where("user_id", user_id).update({
        cards: @.newCardCollection
      })
    .then () ->
      return Promise.map(@.ownedBloodbornCards,(cardId) ->
        return tx("user_cards").where("user_id",user_id).andWhere("card_id",cardId).delete()
      )
    .then () ->
      return Promise.all([
        tx("user_spirit_orbs_opened").where("user_id",user_id).andWhere("card_set",SDK.CardSet.Bloodborn).delete(),
        tx("user_spirit_orbs").where("user_id",user_id).andWhere("card_set",SDK.CardSet.Bloodborn).delete(),
        tx("users").where("id",user_id).update({
          total_orb_count_set_3: 0
        })
      ])
  .then ()->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then ()->
    res.status(200).json({})

router.delete '/inventory/unity', (req, res, next) ->
  user_id = req.user.d.id
  this_obj = {}

  txPromise = knex.transaction (tx)->
    return tx("user_card_collection").where('user_id', user_id).first()
    .bind this_obj
    .then (cardCollectionRow) ->

      @.newCardCollection = {}
      @.ownedUnityCards = []

      for cardId,cardCountData of cardCollectionRow.cards
        sdkCard = SDK.GameSession.getCardCaches().getCardById(cardId)
        if (sdkCard.getCardSetId() == SDK.CardSet.Unity)
          @.ownedUnityCards.push(cardId)
        else
          @.newCardCollection[cardId] = cardCountData

      return tx("user_card_collection").where("user_id", user_id).update({
        cards: @.newCardCollection
      })
    .then () ->
      return Promise.map(@.ownedUnityCards,(cardId) ->
        return tx("user_cards").where("user_id",user_id).andWhere("card_id",cardId).delete()
      )
    .then () ->
      return Promise.all([
        tx("user_spirit_orbs_opened").where("user_id",user_id).andWhere("card_set",SDK.CardSet.Unity).delete(),
        tx("user_spirit_orbs").where("user_id",user_id).andWhere("card_set",SDK.CardSet.Unity).delete(),
        tx("users").where("id",user_id).update({
          total_orb_count_set_4: null
        })
      ])
  .then ()->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then ()->
    res.status(200).json({})

router.delete '/quests/current', (req, res, next) ->
  user_id = req.user.d.id

  twoDaysAgoMoment = moment.utc().subtract(2,"day")

  knex("user_quests").where({'user_id':user_id}).delete()
  .then ()->
    return knex("users").where('id',user_id).update(
      free_card_of_the_day_claimed_at: twoDaysAgoMoment.toDate()
    )
  .then ()->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef

    return Promise.all([
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(user_id).child("daily").child("current").child('quests'))
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(user_id).child("catch-up").child("current").child('quests'))
      FirebasePromises.set(@.fbRootRef.child("users").child(user_id).child("free_card_of_the_day_claimed_at"),twoDaysAgoMoment.valueOf())
    ])
  .then ()->
    QuestsModule.generateDailyQuests(user_id)
  .then ()->
    res.status(200).json({})

router.put '/quests/current', (req, res, next) ->
  user_id = req.user.d.id
  quest_ids = req.body.quest_ids

  # wipe old quests and regenerate just to treat this like a fresh generation
  knex("user_quests").where({'user_id':user_id}).delete()
  .then ()->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef

    return Promise.all([
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(user_id).child("daily").child("current").child('quests'))
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(user_id).child("catch-up").child("current").child('quests'))
    ])
  .then ()->
    QuestsModule.generateDailyQuests(user_id)
  .then ()->
    return Promise.all([
      QuestsModule.mulliganDailyQuest(user_id,0,null,quest_ids[0])
      QuestsModule.mulliganDailyQuest(user_id,1,null,quest_ids[1])
    ])
  .then ()->
    return Promise.all([
      knex("user_quests").where({'user_id':user_id}).update({mulliganed_at:null})
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(user_id).child("daily").child("current").child('quests').child(0).child("mulliganed_at"))
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(user_id).child("daily").child("current").child('quests').child(1).child("mulliganed_at"))
    ])
  .then ()->
    res.status(200).json({})

router.put '/quests/current/progress', (req, res, next) ->
  user_id = req.user.d.id
  quest_slots = req.body.quest_slots
  txPromise = knex.transaction (tx)->
    return Promise.each(quest_slots, (quest_slot) ->
      return tx("user_quests").first().where({'user_id':user_id,'quest_slot_index':quest_slot})
      .then (questRow) ->
        if questRow?
          newProgress = questRow.progress || 0
          newProgress += 1

          return QuestsModule._setQuestProgress(txPromise,tx,questRow,newProgress)
        else
          return Promise.resolve()
    )

  return txPromise
  .then ()->
    res.status(200).json({})
  .catch (errorMessage) ->
    res.status(500).json({message: errorMessage})

router.put '/quests/generated_at', (req, res, next) ->
  user_id = req.user.d.id
  days_back = req.body.days_back



  knex("users").where({'id':user_id}).first("daily_quests_generated_at")
  .bind {}
  .then (row)->
    @.previousGeneratedAt = row.daily_quests_generated_at
    @.newGeneratedAtMoment = moment.utc(row.daily_quests_generated_at).subtract(days_back,'days')
    @.userRow = row
    @.updateData = {
      daily_quests_generated_at: @.newGeneratedAtMoment.toDate()
    }

    knex("users").where({'id':user_id}).update(@.updateData)
  .then () ->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef

    return Promise.all([
      FirebasePromises.set(@.fbRootRef.child("user-quests").child(user_id).child("daily").child("current").child('updated_at'),@.newGeneratedAtMoment.valueOf())
      FirebasePromises.set(@.fbRootRef.child("user-quests").child(user_id).child("daily").child("current").child('generated_at'),@.newGeneratedAtMoment.valueOf())
    ])
  .then () ->
    res.status(200).json({
      generated_at:@.newGeneratedAtMoment.valueOf()
    })

router.post '/quests/setup_frostfire_2016', (req, res, next) ->
  user_id = req.user.d.id

  Promise.all([
    knex("users").where({'id':user_id}).update({
      daily_quests_generated_at:null,
      daily_quests_updated_at:null,
    }),
    knex("user_quests").where("user_id",user_id).delete(),
    knex("user_quests_complete").where("user_id",user_id).andWhere("quest_type_id",30001).delete()
  ]).then ()->
    return QuestsModule.generateDailyQuests(user_id,moment.utc("2016-12-02"))
  .then () ->
    return Promise.all([
      QuestsModule.mulliganDailyQuest(user_id,0,moment.utc("2016-12-02"),101),
      QuestsModule.mulliganDailyQuest(user_id,1,moment.utc("2016-12-02"),101)
    ])
  .then () ->
    return Promise.all([
      knex("user_quests").where("quest_slot_index",0).andWhere("user_id",user_id).update({progress: 3})
      knex("user_quests").where("quest_slot_index",1).andWhere("user_id",user_id).update({progress: 3})
      knex("user_quests").where("quest_slot_index",QuestsModule.SEASONAL_QUEST_SLOT).andWhere("user_id",user_id).update({progress: 13})
    ])
  .then () ->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then () ->
    res.status(200).json({})

router.post '/quests/setup_seasonal_quest', (req, res, next) ->
  user_id = req.user.d.id
  generateQuestsAt = req.body.generate_quests_at

  generateQuestsAtMoment = moment.utc(generateQuestsAt)

  sdkQuestForGenerationTime = SDK.QuestFactory.seasonalQuestForMoment(generateQuestsAtMoment)

  if not sdkQuestForGenerationTime?
    res.status(403).json({message:"No seasonal quest for: " + generateQuestsAtMoment.toString()})
    return

  Promise.all([
    knex("users").where({'id':user_id}).update({
      daily_quests_generated_at:null,
      daily_quests_updated_at:null,
    }),
    knex("user_quests").where("user_id",user_id).delete(),
    knex("user_quests_complete").where("user_id",user_id).andWhere("quest_type_id",sdkQuestForGenerationTime.getId()).delete()
  ]).then ()->
    return QuestsModule.generateDailyQuests(user_id,generateQuestsAtMoment)
  .then () ->
    return Promise.all([
      QuestsModule.mulliganDailyQuest(user_id,0,generateQuestsAtMoment,101),
      QuestsModule.mulliganDailyQuest(user_id,1,generateQuestsAtMoment,1500)
    ])
  .then () ->
    return Promise.all([
      knex("user_quests").where("quest_slot_index",0).andWhere("user_id",user_id).update({progress: 3})
      knex("user_quests").where("quest_slot_index",1).andWhere("user_id",user_id).update({progress: 7})
      knex("user_quests").where("quest_slot_index",QuestsModule.SEASONAL_QUEST_SLOT).andWhere("user_id",user_id).update({progress: 13})
    ])
  .then () ->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then () ->
    res.status(200).json({})

router.post '/quests/setup_promotional_quest', (req, res, next) ->
  user_id = req.user.d.id
  generateQuestsAt = req.body.generate_quests_at

  generateQuestsAtMoment = moment.utc(generateQuestsAt)

  sdkQuestForGenerationTime = SDK.QuestFactory.promotionalQuestForMoment(generateQuestsAtMoment)
  progressToStartWith = sdkQuestForGenerationTime.params["completionProgress"] - 1

  if not sdkQuestForGenerationTime?
    res.status(403).json({message:"No promo quest for: " + generateQuestsAtMoment.toString()})
    return

  Promise.all([
    knex("users").where({'id':user_id}).update({
      daily_quests_generated_at:null,
      daily_quests_updated_at:null,
    }),
    knex("user_quests").where("user_id",user_id).delete(),
    knex("user_quests_complete").where("user_id",user_id).andWhere("quest_type_id",sdkQuestForGenerationTime.getId()).delete()
  ]).then ()->
    return QuestsModule.generateDailyQuests(user_id,generateQuestsAtMoment)
  .then () ->
    return Promise.all([
      knex("user_quests").where("quest_slot_index",QuestsModule.PROMOTIONAL_QUEST_SLOT).andWhere("user_id",user_id).update({progress: progressToStartWith})
    ])
  .then () ->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then () ->
    res.status(200).json({})

router.post '/matchmaking/time_series/:division/values', (req, res, next) ->
  division = req.params.division
  ms = req.body.ms

  rankedQueue.matchMade(division,ms)

  res.status(200).json({})

router.post '/faction_progression/set_all_win_counts_to_99', (req,res,next)->
  user_id = req.user.d.id

  knex("user_faction_progression").where('user_id',user_id)
  .then (rows)->
    all = []
    factionIds = _.map(FactionFactory.getAllPlayableFactions(), (f)-> return f.id)
    Logger.module("QA").log "factionIds ", factionIds
    for factionId in factionIds
      row = _.find(rows, (r)-> return r.faction_id == factionId)
      Logger.module("QA").log "faction #{factionId}", row?.user_id
      if row?
        all.push knex("user_faction_progression").where({
          'user_id':user_id,
          'faction_id':row.faction_id
        }).update(
          'win_count':99
        )
    return Promise.all(all)
  .then ()->
    res.status(200).json({})

router.post '/faction_progression/add_level', (req,res,next)->
  user_id = req.user.d.id
  factionId = req.body.faction_id
  if factionId?
    knex("user_faction_progression").where({'user_id': user_id, "faction_id": factionId}).first()
    .then (factionProgressionRow)->
      if !factionProgressionRow?
        return UsersModule.createFactionProgressionRecord(user_id,factionId, generatePushId(), SDK.GameType.Ranked)
    .then () ->
      return knex("user_faction_progression").where({'user_id': user_id, "faction_id": factionId}).first()
    .then (factionProgressionRow) ->
      if !factionProgressionRow?
        return Promise.reject("No row found for faction #{factionId}")
      else
        currentXP = factionProgressionRow.xp || 0
        currentLevel = SDK.FactionProgression.levelForXP(currentXP)
        nextLevel = currentLevel + 1
        nextLevelXP = SDK.FactionProgression.totalXPForLevel(nextLevel)
        deltaXP = nextLevelXP - currentXP
        if deltaXP <= 0
          return Promise.reject("Cannot increase level for faction #{factionId}, currently at #{currentLevel}")
        else
          winsNeeded = Math.ceil(deltaXP / SDK.FactionProgression.winXP)
          promises = []
          for i in [0...winsNeeded]
            promises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(user_id, factionId, true, generatePushId(), SDK.GameType.Ranked))
          return Promise.all(promises)
    .then ()->
      res.status(200).json({})
    .catch (errorMessage) ->
      res.status(500).json({message: errorMessage})

router.post '/faction_progression/set_all_levels_to_10', (req,res,next)->
  user_id = req.user.d.id

  knex("user_faction_progression").where('user_id',user_id)
  .then (rows)->
    factionIds = _.map(FactionFactory.getAllPlayableFactions(), (f)-> return f.id)
    allPromises = []
    for factionId in factionIds
      row = _.find(rows, (r)-> return r.faction_id == factionId)
      if !row?
        allPromises.push(UsersModule.createFactionProgressionRecord(user_id,factionId,generatePushId(),SDK.GameType.SinglePlayer))
    return Promise.all(allPromises)
  .then () ->
    return knex("user_faction_progression").where('user_id',user_id)
  .then (factionRows) ->
    factionIds = _.map(FactionFactory.getAllPlayableFactions(), (f)-> return f.id)
    winsPerFaction = []
    for factionId in factionIds
      row = _.find(factionRows, (r)-> return r.faction_id == factionId)
      if !row?
        return Promise.reject("No row found for faction - #{factionId}")
      else
        factionXp = row.xp
        xpForLevelTen = SDK.FactionProgression.levelXPTable[10]
        neededXp = xpForLevelTen - factionXp
        xpPerWin = SDK.FactionProgression.winXP
        if neededXp > 0
          neededWins = Math.ceil(neededXp / xpPerWin)
          winsPerFaction = winsPerFaction.concat(Array(neededWins).fill(factionId))
    return Promise.each(winsPerFaction, (factionId) ->
      return UsersModule.updateUserFactionProgressionWithGameOutcome(user_id,factionId,true,generatePushId(),SDK.GameType.Ranked)
    )
  .then ()->
    res.status(200).json({})
  .catch (errorMessage) ->
    res.status(500).json({message: errorMessage})

router.delete '/gauntlet/current', (req,res,next)->
  userId = req.user.d.id

  return DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    return Promise.all([
      knex("user_gauntlet_run").where('user_id',userId).delete()
      FirebasePromises.remove(fbRootRef.child("user-gauntlet-run").child(userId).child("current"))
    ])
  .then () ->
    res.status(200).json({})
  .catch (error) ->
    res.status(403).json({message:error.toString()})

router.delete '/gauntlet/current/general', (req,res,next)->
  userId = req.user.d.id

  # Get current gauntlet data
  knex("user_gauntlet_run").first().where('user_id',userId)
  .bind({})
  .then (gauntletData) ->
    this.gauntletData = gauntletData
    if (not gauntletData?)
      return Promise.reject(new Error("You are not currently in a Gauntlet Run"))

    if (not gauntletData.is_complete)
      return Promise.reject(new Error("Current Gauntlet deck is not complete"))

    cardIdInGeneralSlot = gauntletData.deck[0]
    sdkCard = GameSession.getCardCaches().getCardById(cardIdInGeneralSlot)
    if (not sdkCard.getIsGeneral())
      return Promise.reject(new Error("Current Gauntlet deck does not have general in expected slot"))

    this.newDeck = gauntletData.deck.slice(1)

    return DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    updateData =
      deck: this.newDeck
      general_id: null
    return Promise.all([
      knex("user_gauntlet_run").where('user_id',userId).update(updateData)
      FirebasePromises.update(fbRootRef.child("user-gauntlet-run").child(userId).child("current"),updateData)
    ])
  .then () ->
    res.status(200).json(this.gauntletData)
  .catch (error) ->
    res.status(403).json({message:error.toString()})

router.post '/gauntlet/progress', (req,res,next)->
  userId = req.user.d.id
  isWinner = req.body.is_winner

  Redis.GameManager.generateGameId()
  .then (gameId) ->
    GauntletModule.updateArenaRunWithGameOutcome(userId,isWinner,gameId,false)
  .then (runData) ->
    res.status(200).json(runData)
  .catch (error) ->
    res.status(403).json({message:error.toString()})

router.post '/gauntlet/fill_deck', (req,res,next)->
  userId = req.user.d.id

  # Get current gauntlet data
  knex("user_gauntlet_run").first().where('user_id',userId)
  .then (gauntletData) ->
    recursiveSelect = (gauntletData) ->
      if !gauntletData? || !gauntletData.card_choices? || !gauntletData.card_choices[0]?
        # No more card choices
        res.status(200).json(gauntletData)
      else
        cardIdChoice = null
        if (gauntletData.card_choices?)
          cardIdChoice = gauntletData.card_choices[0]
        else if (gauntletData.general_choices?)
          cardIdChoice = gauntletData.general_choices[0]
        GauntletModule.chooseCard(userId,cardIdChoice)
        .then (newGauntletData) ->
          recursiveSelect(newGauntletData)
    recursiveSelect(gauntletData)
  .catch (error) ->
    res.status(403).json({message:error.message})

router.post '/gift_crate/winter2015', (req,res,next)->
  userId = req.user.d.id

  txPromise = knex.transaction (tx)->
    Promise.all([
      tx("user_emotes").where("user_id",userId).andWhere("emote_id",CosmeticsLookup.Emote.OtherSnowChaserHoliday2015).delete()
      tx("user_rewards").where("user_id",userId).andWhere("source_id",GiftCrateLookup.WinterHoliday2015).delete()
      tx("user_gift_crates").where("user_id",userId).andWhere("crate_type",GiftCrateLookup.WinterHoliday2015).delete()
    ])
    .then ()->
      return GiftCrateModule.addGiftCrateToUser(txPromise,tx,userId,GiftCrateLookup.WinterHoliday2015)
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/gift_crate/lag2016', (req,res,next)->
  userId = req.user.d.id

  txPromise = knex.transaction (tx)->
    Promise.all([
      tx("user_rewards").where("user_id",userId).andWhere("source_id",GiftCrateLookup.FebruaryLag2016).delete()
      tx("user_gift_crates").where("user_id",userId).andWhere("crate_type",GiftCrateLookup.FebruaryLag2016).delete()
    ])
    .then ()->
      return GiftCrateModule.addGiftCrateToUser(txPromise,tx,userId,GiftCrateLookup.FebruaryLag2016)
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/cosmetic_chest/:chest_type', (req,res,next)->
  userId = req.user.d.id
  chestType = req.params.chest_type
  hoursBack = parseInt(req.body.hours_back)

  if not hoursBack?
    hoursBack = 0

  bossId = null
  eventId = null
  if chestType == SDK.CosmeticsChestTypeLookup.Boss
    bossId = SDK.Cards.Boss.Boss3
    eventId = "QA-" + generatePushId()

  txPromise = knex.transaction (tx)->
    return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,chestType,bossId,eventId,1,"soft",generatePushId(),moment.utc().subtract(hoursBack,"hours"))
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/cosmetic_chest_key/:chest_type', (req,res,next)->
  userId = req.user.d.id
  chestType = req.params.chest_type

  txPromise = knex.transaction (tx)->
    return CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,chestType,1,"soft",generatePushId())
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/cosmetic/:cosmetic_id', (req,res,next)->
  userId = req.user.d.id
  cosmetic_id = req.params.cosmetic_id

  txPromise = knex.transaction (tx)->
    return InventoryModule.giveUserCosmeticId(txPromise,tx,userId,cosmetic_id,"soft",generatePushId())
    .then tx.commit
    .catch tx.rollback
    return
  .then ()->
    res.status(200).json({})

router.post '/referrals/events', (req,res,next)->
  userId = req.user.d.id

  eventType = req.body.event_type
  knex("users").where('id',userId).first('referred_by_user_id')
  .then (userRow)->
    ReferralsModule.processReferralEventForUser(userId,userRow.referred_by_user_id,eventType)
  .then ()->
    res.status(200).json({})
  .catch (err)->
    next(err)

router.post '/referrals/mark', (req,res,next)->
  userId = req.user.d.id
  username = req.body.username
  knex("users").where('username',username).first('id')
  .then (userRow)->
    ReferralsModule.markUserAsReferredByFriend(userId,userRow.id)
  .then ()->
    res.status(200).json({})
  .catch (err)->
    next(err)

router.put '/account/reset', (req,res,next)->
  userId = req.user.d.id

  return SyncModule.wipeUserData(userId)
  .then ()->
    res.status(200).json({})
  .catch (err)->
    next(err)

# Allows uploading challenge JSON to S3.
# Needs to be reworked, since the bucket and region are hardcoded.
# Stub the handler so we can remove the AWS SDK dependency.
router.post '/daily_challenge', (req,res,next)->
  return res.status(403).json({})
  ###
  Logger.module("QA").log "Pushing Daily challenge"
  challengeName = req.body.challenge_name
  challengeDescription = req.body.challenge_description
  challengeDifficulty = req.body.challenge_difficulty
  challengeGold = 5
  challengeJSON = req.body.challenge_json
  challengeDate = req.body.challenge_date
  challengeInstructions = req.body.challenge_instructions
  challengeHint = req.body.challenge_hint

  Promise.promisifyAll(zlib)

  zlib.gzipAsync(challengeJSON)
  .bind({})
  .then (gzipGameSessionData) ->
    @.gzipGameSessionData = gzipGameSessionData

    env = null

    if (UtilsEnv.getIsInLocal())
      env = "local"
    else if (UtilsEnv.getIsInStaging())
      env = "staging"
    else
      return Promise.reject(new Error("Unknown/Invalid ENV for storing Daily Challenge"))

    bucket = "duelyst-challenges"

    filename = env + "/" + challengeDate + ".json"
    @.url = "https://s3.#{config.get('aws.region').amazonaws.com/" + bucket + "/" + filename

    Logger.module("QA").log "Pushing Daily challenge with url #{@.url}"

    params =
      Bucket: bucket
      Key: filename
      Body: @.gzipGameSessionData
      ACL: 'public-read'
      ContentEncoding: "gzip"
      ContentType: "text/json"

    return s3.putObjectAsync(params)
  .then () ->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    return FirebasePromises.set(fbRootRef.child("daily-challenges").child(challengeDate),{
      title:        challengeName
      description:  challengeDescription
      gold:          challengeGold
      difficulty:    challengeDifficulty
      instructions: challengeInstructions
      url:          @.url
      challenge_id: generatePushId()
      hint:          challengeHint
    })
  .then () ->
    Logger.module("QA").log "Success Pushing Daily challenge"
    res.status(200).json({})
  .catch (error) ->
    Logger.module("QA").log "Failed Pushing Daily challenge\n #{error.toString()}"
    res.status(403).json({message:error.toString()})
  ###

router.post "/daily_challenge/completed_at", (req, res, next) ->
  user_id = req.user.d.id
  completedAtTime = req.body.completed_at

  lastCompletedData = {
    daily_challenge_last_completed_at: completedAtTime
  }

  Promise.all([
    knex("users").where('id',user_id).update(lastCompletedData),
    knex("user_daily_challenges_completed").where('user_id',user_id).delete()
  ]).then () ->
    lastCompletedData = DataAccessHelpers.restifyData(lastCompletedData)
    res.status(200).json(lastCompletedData)
  .catch (error) ->
    Logger.module("QA").log "Failed updating daily challenge completed at\n #{error.toString()}"
    res.status(403).json({message:error.toString()})

router.post "/daily_challenge/passed_qa", (req, res, next) ->
  dateKey = req.body.date_key

  DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef
    return FirebasePromises.update(@.fbRootRef.child('daily-challenges').child(dateKey),{
      isQAReady: true
    })
  .then () ->
    res.status(200).json({})
  .catch (error) ->
    Logger.module("QA").log "Failed marking daily challenge as passing QA\n #{error.toString()}"
    res.status(403).json({message:error.toString()})

# Updates the users current s rank rating
router.delete '/user_progression/last_crate_awarded_at', (req,res,next)->

  user_id = req.user.d.id
  knex("user_progression").where("user_id",user_id).update({
    last_crate_awarded_at:null,
    last_crate_awarded_game_count:null,
    last_crate_awarded_win_count:null,
  }).then ()->
    res.status(200).json({})

# Resets data for an achievement then marks it as complete
router.post '/achievement/reset_and_complete', (req, res, next) ->
  user_id = req.user.d.id
  achievement_id = req.body.achievement_id

  return   knex("user_achievements").where("user_id",user_id).andWhere("achievement_id",achievement_id).delete()
  .then ()->
    sdkAchievement = SDK.AchievementsFactory.achievementForIdentifier(achievement_id)

    if (sdkAchievement == null)
      return Promise.reject("No such achievement with id: #{achievement_id}")

    achProgressMap = {}
    achProgressMap[achievement_id] = sdkAchievement.progressRequired

    return AchievementsModule._applyAchievementProgressMapToUser(user_id,achProgressMap)
  .then ()->
    Logger.module("QA").log "Completed resetting and completing achievement #{achievement_id}"
    res.status(200).json({})
  .catch (error) ->
    Logger.module("QA").log "Failed resetting and completing achievement\n #{error.toString()}"
    res.status(403).json({message:error.toString()})

router.post '/migration/prismatic_backfill', (req, res, next) ->
  user_id = req.user.d.id
  numOrbs = req.body.num_orbs
  numOrbs = parseInt(numOrbs)

  return knex("users").where('id',user_id).update(
    last_session_version: "1.72.0"
  ).bind {}
  .then () ->
    timeBeforePrismaticFeatureAddedMoment = moment.utc("2016-07-20 20:00")

    return Promise.each([1..numOrbs], (index) ->
      return knex("user_spirit_orbs_opened").insert({
        id: generatePushId()
        user_id: user_id
        card_set: SDK.CardSet.Core
        transaction_type: "soft"
        created_at: timeBeforePrismaticFeatureAddedMoment.toDate()
        opened_at: timeBeforePrismaticFeatureAddedMoment.toDate()
        cards: [1,1,1,1,1]
      })
    )
  .then ()->
    Logger.module("QA").log "Completed setting up prismatic backfill"
    res.status(200).json({})

router.delete '/boss_event', (req, res, next) ->
  bossEventId = "QA-Boss-Event"

  return DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    return FirebasePromises.remove(fbRootRef.child('boss-events').child(bossEventId))
  .then ()->
    Logger.module("QA").log "Completed setting up qa boss event"
    res.status(200).json({})

router.delete '/boss_event/rewards', (req, res, next) ->
  user_id = req.user.d.id

  return Promise.all([
    knex("user_bosses_defeated").where("user_id",user_id).delete(),
    knex("user_cosmetic_chests").where("user_id",user_id).andWhere("chest_type",SDK.CosmeticsChestTypeLookup.Boss).delete(),
    knex("user_cosmetic_chests_opened").where("user_id",user_id).andWhere("chest_type",SDK.CosmeticsChestTypeLookup.Boss).delete()
  ]).then ()->
    return SyncModule._syncUserFromSQLToFirebase(user_id)
  .then ()->
    Logger.module("QA").log "Completed removing user's boss rewards"
    res.status(200).json({})

router.put '/boss_event', (req, res, next) ->
  adjustedMs = req.body.adjusted_ms
  bossId = parseInt(req.body.boss_id)

  eventStartMoment = moment.utc().add(adjustedMs,"milliseconds")

  bossEventId = "QA-Boss-Event"
  bossEventData = {
    event_id: bossEventId
    boss_id: bossId
    event_start: eventStartMoment.valueOf()
    event_end: eventStartMoment.clone().add(1,"week").valueOf()
    valid_end: eventStartMoment.clone().add(1,"week").add(1,"hour").valueOf()
  }

  return DuelystFirebase.connect().getRootRef()
  .bind {}
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef
    return FirebasePromises.remove(@.fbRootRef.child('boss-events').child(bossEventId))
  .then () ->
    return FirebasePromises.set(@.fbRootRef.child('boss-events').child(bossEventId),bossEventData)
  .then ()->
    Logger.module("QA").log "Completed setting up qa boss event"
    res.status(200).json({})

router.put '/rift/duplicates', (req, res, next) ->
  user_id = req.user.d.id

  return knex("user_rift_runs").select().where('user_id', user_id)
  .then (riftRuns) ->
    return Promise.each(riftRuns, (riftRun) ->
      if riftRun.card_choices?
        return knex("user_rift_runs").where('ticket_id', riftRun.ticket_id).update({
          card_choices: [11088, 20076, 11087, 11087, 20209, 11052]
        })
      else
        return Promise.resolve()
    )
  .then ()->
    res.status(200).json({})

# router.put '/premium_currency/amount', (req, res, next) ->
#   user_id = req.user.d.id
#   amount = parseInt(req.body.amount)

#   amountPromise = null

#   txPromise = knex.transaction (tx)->
#     if (amount < 0)
#       return ShopModule.debitUserPremiumCurrency(txPromise,tx,user_id,amount,generatePushId(),"qa tool gift")
#     else
#       return ShopModule.creditUserPremiumCurrency(txPromise,tx,user_id,amount,generatePushId(),"qa tool gift")
#   .then ()->
#     res.status(200).json({})

router.get '/shop/charge_log', (req, res, next) ->
  user_id = req.user.d.id

  return knex("user_charges").select().where('user_id',user_id)
  .then (userChargeRows)->
    res.status(200).json({userChargeRows:userChargeRows})


module.exports = router
