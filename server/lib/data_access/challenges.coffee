Promise = require 'bluebird'
util = require 'util'
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
InventoryModule = require './inventory'
QuestsModule = require './quests'
GamesModule = require './games'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
DataAccessHelpers = require('./helpers')
hashHelpers = require '../hash_helpers.coffee'
AnalyticsUtil = require '../../../app/common/analyticsUtil.coffee'

# SDK imports
SDK = require '../../../app/sdk'
Entity = require '../../../app/sdk/entities/entity'
QuestFactory = require '../../../app/sdk/quests/questFactory'
QuestType = require '../../../app/sdk/quests/questTypeLookup'
GameType = require '../../../app/sdk/gameType'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
NewPlayerProgressionHelper = require '../../../app/sdk/progression/newPlayerProgressionHelper'
NewPlayerProgressionStageEnum = require '../../../app/sdk/progression/newPlayerProgressionStageEnum'
NewPlayerProgressionModuleLookup = require '../../../app/sdk/progression/newPlayerProgressionModuleLookup'

class ChallengesModule

  @DAILY_CHALLENGE_ALLOWABLE_CLOCK_SKEW_IN_DAYS:2

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

    Logger.module("ChallengesModule").time "completeChallengeWithType() -> user #{userId.blue} completed challenge type #{challengeType}."

    knex("user_challenges").where({'user_id':userId,'challenge_id':challengeType}).first()
    .bind this_obj
    .then (challengeRow)->

      if challengeRow and challengeRow.completed_at
        Logger.module("ChallengesModule").debug "completeChallengeWithType() -> user #{userId.blue} has already completed challenge type #{challengeType}."
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

              Logger.module("ChallengesModule").debug "completeChallengeWithType() -> user #{userId.blue} completed challenge quest rewards count: #{ questProgressResponse?.rewards.length}"

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

      Logger.module("ChallengesModule").timeEnd "completeChallengeWithType() -> user #{userId.blue} completed challenge type #{challengeType}."

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

    Logger.module("ChallengesModule").time "markChallengeAsAttempted() -> user #{userId.blue} attempted challenge type #{challengeType}."

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
  # Marks a DAILY challenge as completed.
  # @public
  # @param  {String}  userId        User ID.
  # @param  {String}  challengeId      type of challenge
  # @param  {String}  solutionHash    double check against bots # TODO
  # @param  {Moment} completionTime    UTC Moment to treat the challenge completion as having occurred, defaults to now
  # @param  {Moment} systemTime        Current time of the system, used for debugging
  # @return  {Promise}            Promise that will resolve on completion
  ###
  @markDailyChallengeAsCompleted: (userId,challengeId,solutionHash,completionTime,systemTime)->

    MOMENT_NOW_UTC = systemTime || moment().utc()
    completionTimeUtc  = completionTime || MOMENT_NOW_UTC
    this_obj = {}

    # Verify a challenge in the future nor more than X days old is attempting to be completed
    if Math.abs(completionTimeUtc.diff(MOMENT_NOW_UTC,'days',true)) > ChallengesModule.DAILY_CHALLENGE_ALLOWABLE_CLOCK_SKEW_IN_DAYS
      return Promise.reject(new Errors.DailyChallengeTimeFrameError("Attempting to complete a daily challenge outside allowable time frame."))

    DuelystFirebase.connect().getRootRef().then (fbRootRef)->
      return FirebasePromises.once(fbRootRef.child("daily-challenges").child(completionTimeUtc.format("YYYY-MM-DD")),"value")
    .bind this_obj
    .then (snapshot)->

      Logger.module("ChallengesModule").debug "markDailyChallengeAsCompleted() -> #{userId.blue} wants to complete challenge #{challengeId} for day #{completionTimeUtc.format("YYYY-MM-DD")}. Challenge Spec: ", snapshot.val()

      if not snapshot.val()
        throw new Errors.NotFoundError("Daily Challenge Not Found")

      if snapshot.val().challenge_id != challengeId
        throw new Errors.BadRequestError("Invalid Daily Challenge ID")

      txPromise = knex.transaction (tx)->

        # lock user and challenge row
        Promise.all([
          knex("user_daily_challenges_completed").where({'user_id':userId,'challenge_id':challengeId}).first().forUpdate().transacting(tx)
          knex("users").where({'id':userId}).first('id').forUpdate().transacting(tx)
        ])
        .bind this_obj
        .spread (challengeRow)->

          @.challengeRow = challengeRow

          if @.challengeRow?
            throw new Errors.AlreadyExistsError("Challenge already completed")
          else
            #
            allPromises = []

            # ...
            @.challengeRow =
              user_id:userId
              challenge_id:challengeId
              reward_ids:[]
              completed_at:MOMENT_NOW_UTC.toDate()

            @.goldAmount = goldAmount = snapshot.val().gold

            if goldAmount? and goldAmount > 0
              # set up reward data
              rewardData = {
                id:generatePushId()
                user_id:userId
                reward_category:"daily challenge"
                reward_type:challengeId
                gold:goldAmount
                created_at:MOMENT_NOW_UTC.toDate()
                is_unread:true
              }

              # add it to the reward ids column
              @.challengeRow.reward_ids.push(rewardData.id)

              # add the promise to our list of reward promises
              allPromises.push(knex("user_rewards").insert(rewardData).transacting(tx))

            allPromises.push(knex("user_daily_challenges_completed").insert(@.challengeRow).transacting(tx))
            allPromises.push(knex("users").where('id',userId).update({
              daily_challenge_last_completed_at: completionTimeUtc.toDate()
            }).transacting(tx))

            #
            return Promise.all(allPromises)
        .then ()->
          # if all of the above succeed, update wallet
          return InventoryModule.giveUserGold(txPromise,tx,userId,@.goldAmount,'daily challenge',challengeId)
        .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
        .then tx.commit
        .catch tx.rollback
        return

      .bind this_obj
      .then ()->

        Logger.module("ChallengesModule").debug "markDailyChallengeAsCompleted() -> user #{userId.blue} completed challenge #{challengeId} for day #{completionTimeUtc.format("YYYY-MM-DD")}."

        responseData = { challenge: @.challengeRow }
        return responseData

      return txPromise


module.exports = ChallengesModule
