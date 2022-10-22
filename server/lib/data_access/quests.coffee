Promise = require 'bluebird'
util = require 'util'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
_ = require 'underscore'
InventoryModule = require './inventory'
CosmeticChestsModule = require './cosmetic_chests'
SyncModule = require './sync'
GamesModule = require './games'
GiftCrateModule = require './gift_crate'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'

# redis
{Redis, Jobs, GameManager} = require '../../redis/'

# SDK imports
SDK = require '../../../app/sdk'
QuestFactory = require '../../../app/sdk/quests/questFactory'
QuestCatchUp = require '../../../app/sdk/quests/questCatchUp.coffee'
QuestType = require '../../../app/sdk/quests/questTypeLookup'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
NewPlayerProgressionHelper = require '../../../app/sdk/progression/newPlayerProgressionHelper'
NewPlayerProgressionStageEnum = require '../../../app/sdk/progression/newPlayerProgressionStageEnum'

class QuestsModule

  # Quest Slot definitions
  @DAILY_QUEST_SLOTS:[0..1]
  @CATCH_UP_QUEST_SLOT:10
  @SEASONAL_QUEST_SLOT:20
  @PROMOTIONAL_QUEST_SLOT:30

  # control if seasonal / catchup quests should be active
  @SEASONAL_QUESTS_ACTIVE: true
  @CATCH_UP_QUEST_ACTIVE: true
  @PROMOTIONAL_QUEST_ACTIVE: true

  # Catch up quest reward definitions
  @CATCH_UP_CHARGE_GOLD_VALUE: 50
  @CATCH_UP_MAX_GOLD_VALUE: 50

  ###*
  # Checks if a user needs daily quests.
  # @public
  # @param  {String}  userId    User ID for which to check.
  # @param  {Moment}  systemTime  Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}        Promise that will post a BOOL value if the user needs new daily quests.
  ###
  @needsDailyQuests: (userId,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not find if user needs daily quests: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()

    return Promise.all([
      knex("user_new_player_progression").first('stage').where('module_name','core').andWhere('user_id',userId)
      knex('users').first('daily_quests_generated_at').where('id',userId),
      knex('user_quests').select().where('user_id',userId),
    ])
    .bind {}
    .spread (newPlayerProgressionRow,userRow,questRows) ->

      currentStage = NewPlayerProgressionStageEnum[newPlayerProgressionRow?.stage] || NewPlayerProgressionStageEnum.Tutorial
      if currentStage.value < NewPlayerProgressionHelper.DailyQuestsStartToGenerateStage.value
        return Promise.resolve(false)

      # if the first two quest slots are populated by begginer quests, no need to generate daily quests "yet"
      begginerQuestsInFirstTwoSlots = _.filter questRows, (q)-> return q.quest_slot_index < 2 and QuestFactory.questForIdentifier(q.quest_type_id)?.isBeginner
      if begginerQuestsInFirstTwoSlots?.length == 2
        return Promise.resolve(false)

      if questRows?
        for quest in questRows
          # remove any quests that are no longer in the quest factory at all
          if !QuestFactory.questForIdentifier(quest.quest_type_id)
            return Promise.resolve(true)
          # remove any quests that are no longer supposed to be in the system
          if _.contains(QuestFactory.questForIdentifier(quest.quest_type_id).types,QuestType.ExcludeFromSystem)
            return Promise.resolve(true)
          # remove catch up quests that ended up in wrong slot.
          if _.contains(QuestFactory.questForIdentifier(quest.quest_type_id).types,QuestType.CatchUp) and quest.quest_slot_index != QuestsModule.CATCH_UP_QUEST_SLOT
            return Promise.resolve(true)

      if userRow.daily_quests_generated_at?

        now_utc_val = MOMENT_NOW_UTC.valueOf()
        daysPassed = (now_utc_val - moment(userRow.daily_quests_generated_at).utc().valueOf()) / 1000 / 60 / 60 / 24
        if daysPassed < 1
          return Promise.resolve(false)
        else
          return Promise.resolve(true)

      else

        return Promise.resolve(true)

  ###*
  # Generates firebase format of quest data from a given quest
  # @public
  # @param  {Quest}    quest      The SDK quest object.
  # @param  {Moment}  createdAt    OPTIONA: Custom moment date to use for created / begin_at attributes.
  # @return  {Object}          the json representation of the given quest
  ###
  @_questDataForQuest: (quest,createdAt) ->
    createdAt = createdAt || moment().utc()
    quest_data = {}
    quest_data.is_unread = true
    quest_data.begin_at = createdAt.clone().startOf('day').toDate()
    quest_data.created_at = createdAt.toDate()
    if quest.getGoldReward()
      quest_data.gold = quest.getGoldReward()
    if quest.getSpiritOrbsReward()
      quest_data.spirit_orbs = quest.getSpiritOrbsReward()
    quest_data.quest_type_id = quest.id
    quest_data.is_replaceable = quest.getIsReplaceable()
    quest_data.params = quest.params
    # quest_data.completion_count = 0
    quest_data.progress = 0
    # quest_data.quest_name = quest.getName()
    # quest_data.quest_instructions = quest.getDescription()

    return quest_data

  ###*
  # Generate one new daily quest for a user. If run for the first time, it will generate 2 daily quests.
  # @public
  # @param  {String}  userId    User ID for which to generate new daily quests.
  # @param  {Moment}  systemTime  Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}        Promise that will post QUEST DATA on completion.
  ###
  @generateDailyQuests: (userId,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not find if user needs daily quests: invalid user ID - #{userId}"))

    Logger.module("QuestsModule").time "generateDailyQuests() -> for user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      Promise.all([
        knex("users")
          .transacting(tx)
          .forUpdate()
          .first().where('id',userId),
        knex("user_quests")
          .transacting(tx)
          .forUpdate()
          .select().where({'user_id':userId})
      ])
      .bind this_obj
      .spread (userRow,questRows)->

        @.updatedQuests = []
        @.userRow = userRow
        @.removedQuests = []

        removalQueries = []
        allQueries = []

        quest_ids_generated = []

        # Remove any invalid quests and build list of existing generated quest ids
        questRows = _.reduce(questRows,((memo,row,i)=>
          sdkQuest = QuestFactory.questForIdentifier(row.quest_type_id)
          # remove any quests that are no longer in the quest factory at all
          if !sdkQuest?
            removalQueries.push tx("user_quests").where({user_id:row.user_id,quest_slot_index:row.quest_slot_index}).delete()
            row.quest_slot_index = -1
          # remove any quests that are no longer supposed to be in the system
          else if _.contains(sdkQuest.types,QuestType.ExcludeFromSystem)
            removalQueries.push tx("user_quests").where({user_id:row.user_id,quest_slot_index:row.quest_slot_index}).delete()
            row.quest_slot_index = -1
          # remove any expired promo quests
          else if _.contains(sdkQuest.types,QuestType.Promotional) and not sdkQuest.isAvailableOn(MOMENT_NOW_UTC)
            removalQueries.push tx("user_quests").where({user_id:row.user_id,quest_slot_index:row.quest_slot_index}).delete()
            row.previous_quest_slot_index = row.quest_slot_index
            row.quest_slot_index = -1
            @.removedQuests.push row
          # remove catch up quests that ended up in wrong slot.
          else if _.contains(sdkQuest.types,QuestType.CatchUp) and row.quest_slot_index != QuestsModule.CATCH_UP_QUEST_SLOT
            removalQueries.push tx("user_quests").where({user_id:row.user_id,quest_slot_index:row.quest_slot_index}).delete()
            row.quest_slot_index = -1
          else
            memo.push(row)
            # make sure we don't generate duplicate quests
            quest_ids_generated.push(row.quest_type_id)
          return memo
        ),[])

        # generate a seasonal quest if needed
        # seasonal quests like the frostfire quest are intended to last for 1 month or so and have long completion goals
        # you can only have one seasonal quest active at a time, and it can not be replaced
        existingSeasonalQuest = _.find(questRows, (q)-> return q.quest_slot_index == QuestsModule.SEASONAL_QUEST_SLOT)
        if not existingSeasonalQuest and QuestsModule.SEASONAL_QUESTS_ACTIVE
          Logger.module("QuestsModule").debug("generateDailyQuests() -> No active seasonal quest found for user #{userId.blue}.")
          seasonalQuest = QuestFactory.seasonalQuestForMoment(MOMENT_NOW_UTC)
          if seasonalQuest?
            Logger.module("QuestsModule").debug("generateDailyQuests() -> Current season has quest #{seasonalQuest.name}. #{userId.blue}.")
            sQuest = QuestsModule._questDataForQuest(seasonalQuest,MOMENT_NOW_UTC)
            sQuest.user_id = userId
            sQuest.quest_slot_index = QuestsModule.SEASONAL_QUEST_SLOT
            # add to the list of generated quests so we don't create duplicates
            quest_ids_generated.push(seasonalQuest.id)
            allQueries.push tx("user_quests_complete").where("user_id", userId).andWhere('quest_type_id', seasonalQuest.id).first().then (completedQuestRow)=>
              if not completedQuestRow?
                Logger.module("QuestsModule").debug("generateDailyQuests() -> Generating #{seasonalQuest.name} seasonal quest for #{userId.blue}.")
                # update return data
                @.updatedQuests.push(sQuest)
                questRows.push(sQuest)
                # save quest
                return tx.insert(sQuest).into("user_quests")
              else
                Logger.module("QuestsModule").debug("generateDailyQuests() -> User #{userId.blue} already completed #{seasonalQuest.name} seasonal quest.")

        # generate a promotional quest if needed
        existingPromotionalQuest = _.find(questRows, (q)-> return q.quest_slot_index == QuestsModule.PROMOTIONAL_QUEST_SLOT)
        newPromotionalQuest = QuestFactory.promotionalQuestForMoment(MOMENT_NOW_UTC)
        replaceCurrentPromoQuest = existingPromotionalQuest? and newPromotionalQuest? and existingPromotionalQuest.id < newPromotionalQuest.id

        if (not existingPromotionalQuest? and newPromotionalQuest? or replaceCurrentPromoQuest) and QuestsModule.PROMOTIONAL_QUEST_ACTIVE
          Logger.module("QuestsModule").debug("generateDailyQuests() -> No active promotional quest found for user #{userId.blue}.")
          if newPromotionalQuest?
            Logger.module("QuestsModule").debug("generateDailyQuests() -> Current promotional quest #{newPromotionalQuest.name}. #{userId.blue}.")
            pQuest = QuestsModule._questDataForQuest(newPromotionalQuest,MOMENT_NOW_UTC)
            pQuest.user_id = userId
            pQuest.quest_slot_index = QuestsModule.PROMOTIONAL_QUEST_SLOT
            # add to the list of generated quests so we don't create duplicates
            quest_ids_generated.push(newPromotionalQuest.id)
            allQueries.push tx("user_quests_complete").where("user_id", userId).andWhere('quest_type_id', newPromotionalQuest.id).first().then (completedQuestRow)=>
              if not completedQuestRow?
                Logger.module("QuestsModule").debug("generateDailyQuests() -> Generating #{newPromotionalQuest.name} promotional quest for #{userId.blue}.")
                # update return data
                @.updatedQuests.push(pQuest)
                questRows.push(pQuest)
                # save quest
                return tx.insert(pQuest).into("user_quests")
              else
                Logger.module("QuestsModule").debug("generateDailyQuests() -> User #{userId.blue} already completed #{newPromotionalQuest.name} promotional quest.")

        # Determine number of catchup charges to give player
        daysSinceGeneration = MOMENT_NOW_UTC.clone().startOf('day').diff(moment.utc(userRow.daily_quests_generated_at),'days')
        if daysSinceGeneration > 0 and QuestsModule.CATCH_UP_QUEST_ACTIVE
          numCatchUpChargesGenerated = 0
          # 1 charge per incompleted daily quest
          numCatchUpChargesGenerated += _.reduce(questRows, (memo,questRow) ->
            sdkQuest = QuestFactory.questForIdentifier(questRow.quest_type_id)
            if sdkQuest? and not sdkQuest.isCatchUp and not sdkQuest.isBeginner and questRow.quest_slot_index < QuestsModule.CATCH_UP_QUEST_SLOT
              return memo + 1
            else
              return memo
          ,0)
          # 2 charges per day missed without quest generation (Doesn't count the current 1)
          daysSinceGeneration = MOMENT_NOW_UTC.clone().startOf('day').diff(moment.utc(userRow.daily_quests_generated_at),'days')
          # days since generation has to be at least 1 when we are here generating quests
          daysSinceGeneration = Math.max(daysSinceGeneration,1)
          numCatchUpChargesGenerated += (daysSinceGeneration - 1) * 2

          if (numCatchUpChargesGenerated != 0)
            allQueries.push QuestsModule._giveUserCatchUpQuestCharge(txPromise,tx,userId,numCatchUpChargesGenerated,MOMENT_NOW_UTC).then (catchupQuestRow)=>
              if catchupQuestRow?
                questRows.push(catchupQuestRow)
                #TODO: should we also add the catchup quest to @.updatedQuests.push(sQuest) to somehow mark the daily_quests_updated_at as dirty?

        for i in QuestsModule.DAILY_QUEST_SLOTS
          questAtSlot = undefined
          for r in questRows
            if r.quest_slot_index == i
              questAtSlot = r
              break

          if not questAtSlot

            Logger.module("QuestsModule").debug("generateDailyQuests() -> Generating quest for slot #{i}. user #{userId.blue}.")

            sdkQuest = QuestFactory.randomQuestForSlotExcludingIds(i,quest_ids_generated)
            quest = QuestsModule._questDataForQuest(sdkQuest,MOMENT_NOW_UTC)
            quest.user_id = userId
            quest.quest_slot_index = i
            # add to the list of generated quests so we don't create duplicates
            quest_ids_generated.push(sdkQuest.id)

            @.updatedQuests.push(quest)

            allQueries.push(
              knex.insert(quest).into("user_quests").transacting(tx)
            )

            # update return data
            questRows.push(quest)


        # save out final quest rows for method response
        @.questRows = questRows

        # Logger.module("QuestsModule").debug("generateDailyQuests() -> Saving to DB. Executing #{allQueries.length} queries. user #{userId.blue}.")
        return Promise.all(removalQueries).then ()-> return Promise.all(allQueries)

      .then ()->
        start_of_today_utc = MOMENT_NOW_UTC.clone().startOf('day').toDate()
        dirty = false
        # if we generated new quests
        if @.updatedQuests.length > 0
          # mark that we've updated quests on the user
          @.userRow.daily_quests_updated_at = MOMENT_NOW_UTC.toDate()
          @.userRow.daily_quests_generated_at = start_of_today_utc
          dirty = true
        # if it's a new day
        if start_of_today_utc.valueOf() != @.userRow.daily_quests_generated_at?.valueOf()
          # always mark the last time that question generation ran regardless if an update occured
          @.userRow.daily_quests_generated_at = start_of_today_utc
          dirty = true
        # update user record if needed
        if dirty
          Logger.module("QuestsModule").debug("generateDailyQuests() -> Updating user record. user #{userId.blue}.")
          return tx("users").where('id',userId).update(
            daily_quests_generated_at:  @.userRow.daily_quests_generated_at
            daily_quests_updated_at:  @.userRow.daily_quests_updated_at
          )
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      return DuelystFirebase.connect().getRootRef()

    .then (fbRootRef) ->
      @.fbRootRef = fbRootRef

      allPromises = []

      for q in @.removedQuests

        slotIndex = q.previous_quest_slot_index

        allPromises.push(
          FirebasePromises.remove(@.fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('quests').child(slotIndex))
        )

      return Promise.all(allPromises)

    .then () ->

      allPromises = []

      for q in @.updatedQuests

        data = _.clone(q)
        slotIndex = data.quest_slot_index
        delete data.quest_slot_index
        delete data.user_id
        data.created_at = moment.utc(data.created_at).valueOf()
        data.begin_at = moment.utc(data.begin_at).valueOf()
        if data.mulliganed_at then data.mulliganed_at = moment.utc(data.mulliganed_at).valueOf()
        if data.updated_at then data.updated_at = moment.utc(data.updated_at).valueOf()

        allPromises.push(
          FirebasePromises.set(@.fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('quests').child(slotIndex),data)
          FirebasePromises.set(@.fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('updated_at'),moment().utc(@.userRow.daily_quests_updated_at).valueOf())
          FirebasePromises.set(@.fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('generated_at'),moment().utc(@.userRow.daily_quests_generated_at).valueOf())
        )

      # Logger.module("QuestsModule").debug("generateDailyQuests() -> Saving #{allPromises.length} quests to Firebase. user #{userId.blue}.")

      return Promise.all(allPromises)

    .then ()->

      Logger.module("QuestsModule").timeEnd "generateDailyQuests() -> for user #{userId.blue}.".green

      quests = {}

      for quest in @.questRows
        quests[quest.quest_slot_index] = quest

      returnData =
        generated_at: @.userRow.daily_quests_generated_at
        updated_at: @.userRow.daily_quests_updated_at
        quests: quests

      return returnData

    return txPromise

  ###*
  # Does this user need beginner quests.
  # @public
  # @param  {String}  userId    User ID for which to check.
  # @param  {Moment}  systemTime  Pass in the current system time to use to check. Used only for testing.
  # @return  {Promise}        Promise that will return TRUE/FALSE on completion.
  ###
  @needsBeginnerQuests: (userId,systemTime) ->

    throw new Error("This method has not been tested!")

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not find if user needs daily quests: invalid user ID - #{userId}"))

    Logger.module("QuestsModule").time "generateBeginnerQuests() -> for user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    knex("user_new_player_progression").first('stage').where('module_name','core').andWhere('user_id',userId)
    .bind this_obj
    .then (newPlayerCoreStateRow)->

      # current player stage
      newPlayerStage = NewPlayerProgressionStageEnum[newPlayerCoreStateRow?.stage] || NewPlayerProgressionStageEnum.Tutorial

      # quests for this stage
      questsToGenerate = NewPlayerProgressionHelper.questsForStage(newPlayerStage)

      # skip if nothing needs to be done
      if not questsToGenerate? or questsToGenerate.length == 0
        return false
      else
        return true

  ###*
  # Generate a quest for new player progression if they need it.
  # @public
  # @param  {String}  userId    User ID for which to generate new daily quests.
  # @param  {Moment}  systemTime  Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}        Promise that will post QUEST DATA on completion.
  ###
  @generateBeginnerQuests: (userId,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not find if user needs daily quests: invalid user ID - #{userId}"))

    Logger.module("QuestsModule").time "generateBeginnerQuests() -> for user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    knex("user_new_player_progression").first('stage').where('module_name','core').andWhere('user_id',userId)
    .bind this_obj
    .then (newPlayerCoreStateRow)->

      # current player stage
      newPlayerStage = NewPlayerProgressionStageEnum[newPlayerCoreStateRow.stage] || NewPlayerProgressionStageEnum.Tutorial

      Logger.module("QuestsModule").debug "generateBeginnerQuests() -> stage #{newPlayerStage.key} for user #{userId.blue}."

      # quests for this stage
      questsToGenerate = NewPlayerProgressionHelper.questsForStage(newPlayerStage)

      # skip if nothing needs to be done
      if not questsToGenerate? or questsToGenerate.length == 0
        throw new Errors.NoNeedForNewBeginnerQuestsError()

      return knex.transaction (tx)->

        Promise.all([
          tx("users").first('id').where('id',userId).forUpdate(),
          tx("user_quests").select().where({'user_id':userId}).forUpdate(),
          tx("user_quests_complete").select('quest_type_id').where({'user_id':userId}),
        ])
        .bind this_obj
        .spread (userRow,questRows,questCompleteRows)->

          @.updatedQuests = []
          @.userRow = userRow
          @.questRows = questRows

          allQueries = []

          for sdkQuest in questsToGenerate
            questExists = _.find(questRows,(q)-> q.quest_type_id == sdkQuest.id)
            questCompleted = _.find(questCompleteRows,(q)-> q.quest_type_id == sdkQuest.id)
            if questExists || questCompleted
              throw new Errors.NoNeedForNewBeginnerQuestsError("Beginner quests for this stage have already been generated.")

          # if questsToGenerate.length > (QuestsModule.MAX_QUEST_SLOTS-questRows.length)
          #   throw new Error("Not enough room to generate beginner quests.")

          for i in [questRows.length .. questRows.length + questsToGenerate.length]

            # if we've already popped off all the custom quests
            if questsToGenerate.length == 0
              break

            questAtSlot = _.find questRows, (q)-> q.quest_slot_index == i

            if not questAtSlot

              Logger.module("QuestsModule").debug("generateBeginnerQuests() -> Generating quest for slot #{i}. user #{userId.blue}.")

              sdkQuest = questsToGenerate.pop()
              quest = QuestsModule._questDataForQuest(sdkQuest,MOMENT_NOW_UTC)
              quest.user_id = userId
              quest.quest_slot_index = i

              @.updatedQuests.push(quest)

              allQueries.push(
                tx.insert(quest).into("user_quests")
              )

              # update return data
              questRows.push(quest)

          return Promise.all(allQueries)

        .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
        .then tx.commit
        .catch tx.rollback
        return
      .bind this_obj
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (fbRootRef) ->

        allPromises = []

        for q in @.updatedQuests

          data = _.clone(q)
          slotIndex = data.quest_slot_index
          delete data.quest_slot_index
          delete data.user_id
          data.created_at = moment.utc(data.created_at).valueOf()
          data.begin_at = moment.utc(data.begin_at).valueOf()
          if data.mulliganed_at then data.mulliganed_at = moment.utc(data.mulliganed_at).valueOf()
          if data.updated_at then data.updated_at = moment.utc(data.updated_at).valueOf()

          #TODO: should we somehow mark the daily_quests_updated_at of the user row for begginer quest generation as well?
          #TODO: below we seem to be double (we're in a loop) updating the quests updated_at property in Firebase

          allPromises.push(
            FirebasePromises.set(fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('quests').child(slotIndex),data)
            FirebasePromises.set(fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('updated_at'),moment().utc(@.userRow.daily_quests_updated_at).valueOf())
          )

        # Logger.module("QuestsModule").debug("generateDailyQuests() -> Saving #{allPromises.length} quests to Firebase. user #{userId.blue}.")

        return Promise.all(allPromises)

    .then ()->

      Logger.module("QuestsModule").timeEnd "generateBeginnerQuests() -> for user #{userId.blue}.".green

      quests = []

      for quest in @.questRows
        quests[quest.quest_slot_index] = quest

      returnData =
        updated_at: @.userRow.daily_quests_updated_at
        quests: quests

      return returnData

  ###*
  # Checks if a user can mulligan any daily quests.
  # @public
  # @param  {String}  userId    User ID for which to check.
  # @param  {Integer}  questIndex  Index of quest to attempt to mulligan.
  # @param  {Moment}  systemTime  Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}        Promise that will post a BOOL value if the user can mulligan the daily quest.
  ###
  @canMulliganDailyQuest: (userId,questIndex,systemTime) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not find if user needs daily quests: invalid user ID - #{userId}"))

    MOMENT_NOW_UTC = systemTime || moment().utc()

    return knex.first().from('user_quests').where({'user_id':userId,'quest_slot_index':questIndex})
    .bind {}
    .then (questRow)->
      if questRow?

        if not questRow.is_replaceable
          return Promise.resolve(false)

        # looks like the user has no record of ever mulliganing a quest
        if not questRow.mulliganed_at
          return Promise.resolve(true)

        now_utc_val = MOMENT_NOW_UTC.valueOf()
        mulliganed_at_val = moment.utc(questRow.mulliganed_at).valueOf()
        diff = now_utc_val-mulliganed_at_val
        duration = moment.duration(diff)

        # if a day (as 23 hours to avoid bugs) has rolled over since the last mulligan
        if duration.asHours() < 23
          return Promise.resolve(false)
        else
          return Promise.resolve(true)

      else

        return Promise.resolve(false)

  ###*
  # Checks if a user can mulligan any daily quests.
  # @public
  # @param  {String}  userId          User ID for which to check.
  # @param  {String}  questIndex        Quest index to mulligan.
  # @param  {Moment}  systemTime        Pass in the current system time to use to generate quests. Used mostly for testing.
  # @param  {Integer}  replaceWithQuestId    The specific SDK quest ID to replace the quest with. Used mostly for testing.
  # @return  {Promise}              Promise that will post the mulliganed quest data.
  ###
  @mulliganDailyQuest: (userId,questIndex,systemTime,replaceWithQuestId) ->

    # userId must be defined
    if !userId
      return Promise.reject(new Error("Can not mulligan daily quests: invalid user ID - #{userId}"))

    Logger.module("QuestsModule").time "mulliganDailyQuest() -> mulliganed quest slot #{questIndex} by user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()


    this_obj = {}

    return knex.transaction (tx)->

      knex("user_quests").select().where({'user_id':userId}).transacting(tx).forUpdate()
      .bind this_obj
      .then (questRows)->

        @.questRows = questRows

        if questRows?.length > 0

          quest_ids_generated = []

          for quest in questRows
            quest_ids_generated.push(quest.quest_type_id)

          questToMulligan = _.find(questRows,(q)-> return q.quest_slot_index == questIndex)

          Logger.module("QuestsModule").debug("mulliganDailyQuest() -> About to mulliganing quest type #{questToMulligan.quest_type_id}. user #{userId.blue}.")

          if not questToMulligan?.is_replaceable
            throw new Errors.BadRequestError("Can not mulligan this quest type")

          if questToMulligan?

            if questToMulligan.mulliganed_at
              now_utc_val = MOMENT_NOW_UTC.valueOf()
              mulliganed_at_val = moment.utc(questToMulligan.mulliganed_at).valueOf()
              diff = now_utc_val-mulliganed_at_val
              duration = moment.duration(diff)

              if duration.asHours() < 23
                Logger.module("QuestsModule").error("mulliganDailyQuest() -> Can not mulligan quest #{questIndex} because it's only been #{duration.asHours()} hours. user #{userId.blue}.")
                return Promise.reject(new Errors.QuestCantBeMulliganedError("This quest has already been mulliganed today"))

            questToMulliganArrayIndex = _.indexOf(questRows,questToMulligan)

            Logger.module("QuestsModule").debug("mulliganDailyQuest() -> Mulliganing quest #{questIndex}. user #{userId.blue}.")

            start_of_today_utc = MOMENT_NOW_UTC.clone().startOf('day').toDate()

            quest1 = QuestFactory.randomQuestForSlotExcludingIds(questIndex,quest_ids_generated)

            # if we requested a SPECIFIC quest as a replacement, use that quest
            if replaceWithQuestId?
              quest1 = QuestFactory.questForIdentifier(replaceWithQuestId)

            questData = QuestsModule._questDataForQuest(quest1,MOMENT_NOW_UTC)
            questData.quest_slot_index = questIndex
            questData.mulliganed_at = start_of_today_utc
            questData.progressed_by_game_ids = []

            @.questData = questData

            questRows[questToMulliganArrayIndex] = questData

            return knex("user_quests").where({'user_id':userId,'quest_slot_index':questIndex}).update(questData).transacting(tx)

          else

            return Promise.reject(new Error("No quest found at index #{questIndex}"))

      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .then tx.commit
      .catch tx.rollback
      return

    .bind this_obj
    .then ()->

      # Logger.module("QuestsModule").debug("mulliganDailyQuest() -> DONE. Saving FB.".green)

      return DuelystFirebase.connect().getRootRef()

    .then (fbRootRef) ->

      # update user firebase data
      data = _.clone(@.questData)
      slotIndex = data.quest_slot_index
      delete data.quest_slot_index
      delete data.user_id
      data.created_at = moment.utc(data.created_at).valueOf()
      data.begin_at = moment.utc(data.begin_at).valueOf()
      if data.mulliganed_at then data.mulliganed_at = moment.utc(data.mulliganed_at).valueOf()
      if data.updated_at then data.updated_at = moment.utc(data.updated_at).valueOf()

      return FirebasePromises.set(fbRootRef.child("user-quests").child(userId).child("daily").child("current").child("quests").child(questIndex),data)

    .then ()->

      toReturn = []

      for quest in @.questRows
        toReturn[quest.quest_slot_index] = quest

      Logger.module("QuestsModule").timeEnd "mulliganDailyQuest() -> mulliganed quest slot #{questIndex} by user #{userId.blue}.".green

      return toReturn

  ###*
  # Update quest progress for a user given a game.
  # @public
  # @param  {String}    userId      User ID for which to process quests.
  # @param   {String}    gameId       Game ID for which to calculate quest progress.
  # @param  {String}    gameSession   Full game session data for which to calculate quest progress.
  # @param  {Moment}    systemTime    Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}            Promise that will post { quests:[] rewards:[] } on completion.
  ###
  @updateQuestProgressWithGame: (userId, gameId, gameSessionData, systemTime) ->

    # userId or gameId must be defined
    if !userId or !gameId
      return Promise.reject(new Error("Can not update quest progress : invalid user ID - #{userId} - or game ID - #{gameId}"))
    if !gameSessionData
      return Promise.reject(new Error("Invalid game session data"))

    Logger.module("QuestsModule").time "updateQuestProgressWithGame() -> for game #{gameId} by user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.resolve(tx("users").where({'id':userId}).first('id').forUpdate())
      .bind this_obj
      .then (userRow)->
        return Promise.all([
          userRow,
          tx("user_quests").select().where({'user_id':userId}).forUpdate()
        ])
      .spread (userRow,questRows)->

        # Logger.module("QuestsModule").debug "updateQuestProgressWithGame() -> ACQUIRED LOCK ON #{userId}".yellow

        @.userRow = userRow
        @.questRows = questRows

        if questRows?.length > 0

          allQueries = []

          for quest in questRows

            try

              # generate a quest model object based on quest ID
              questModel = QuestFactory.questForIdentifier(quest.quest_type_id)

              # check if game and player satisfied this class of quest
              progressAmount = questModel.progressForGameDataForPlayerId(gameSessionData,userId)

              if progressAmount > 0

                # track which games progressed a quest,
                quest.progressed_by_game_ids ?= []
                quest.progressed_by_game_ids.push(gameId)

                quest.progress ?= 0
                allQueries.push QuestsModule._setQuestProgress(txPromise,tx,quest,quest.progress + progressAmount,gameId,MOMENT_NOW_UTC)

              else

                Logger.module("QuestsModule").debug "updateQuestProgressWithGame() -> quest[#{quest.quest_slot_index}] NOT satisfied: #{questModel.getName()} User #{userId.blue}. Game [G:#{gameId}].".yellow

            catch e

              Logger.module("QuestsModule").debug("updateQuestProgressWithGame() -> caught ERROR processing QUEST DATA".red, e)
              return Promise.reject(new Error("ERROR PROCESSING QUEST DATA"))
              break

          # check for any completed quests and if we need to progress "quest based" quests
          for quest in questRows
            if quest.completed_at
              completedQuest = quest
              # if any "quest completion" quests need to be progressed
              allQueries.push(QuestsModule.updateQuestProgressWithCompletedQuest(txPromise, tx, completedQuest.user_id, gameId, completedQuest.quest_type_id, questRows))

          return Promise.all(allQueries)

        else

          # no quests, no need to update anything
          return Promise.resolve()
      .then (rewards)-> @.rewards = _.flatten(_.compact(rewards))
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("QuestsModule").error "updateQuestProgressWithGame() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    .then ()->

      quests = []

      for quest in @.questRows
        quests[quest.quest_slot_index] = quest

      toReturn =
        quests:quests
        rewards:@.rewards

      Logger.module("QuestsModule").timeEnd "updateQuestProgressWithGame() -> for game #{gameId} by user #{userId.blue}.".green

      return toReturn

    .finally ()-> return GamesModule.markClientGameJobStatusAsComplete(userId,gameId,'quests')


    return txPromise

  ###*
  # Update quest progress for a user given a completed challenge.
  # @public
  # @param  {Promise}    txPromise    Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  tx        KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID for which to process quests.
  # @param   {String}    challengeId   Challenge ID for which to calculate quest progress.
  # @param  {Moment}    systemTime    Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}            Promise that will post { quests:[] rewards:[] } on completion.
  ###
  @updateQuestProgressWithCompletedChallenge: (txPromise, tx, userId, challengeId, systemTime) ->

    # userId or challengeId must be defined
    if !userId or !challengeId
      return Promise.reject(new Error("Can not update quest progress : invalid user ID - #{userId} - or challenge ID - #{challengeId}"))

    Logger.module("QuestsModule").time "updateQuestProgressWithCompletedChallenge() -> for challenge #{challengeId} by user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    return Promise.all([
      tx("users").where({'id':userId}).first('id').forUpdate()
      tx("user_quests").select().where({'user_id':userId}).forUpdate()
    ])
    .bind {}
    .spread (userRow,questRows)->

      @.userRow = userRow
      @.questRows = questRows

      if questRows?.length > 0

        allQueries = []

        for quest in questRows

          try

            # generate a quest model object based on quest ID
            questModel = QuestFactory.questForIdentifier(quest.quest_type_id)

            # check if game and player satisfied this class of quest
            progressAmount = questModel.progressForChallengeId(challengeId)

            if progressAmount > 0

              quest.progress ?= 0
              allQueries.push QuestsModule._setQuestProgress(txPromise,tx,quest,quest.progress + progressAmount,null,MOMENT_NOW_UTC)

            else

              Logger.module("QuestsModule").debug "updateQuestProgressWithCompletedChallenge() -> quest[#{quest.quest_slot_index}] NOT satisfied: #{questModel.getName()} User #{userId.blue}. Challenge: #{challengeId}.".yellow

          catch e

            Logger.module("QuestsModule").debug("updateQuestProgressWithCompletedChallenge() -> caught ERROR processing QUEST DATA".red, e)
            return Promise.reject(new Error("ERROR PROCESSING QUEST DATA"))
            break

        return Promise.all(allQueries)

      else

        # no quests, no need to update anything
        return Promise.resolve()

    .then (rewards)-> @.rewards = _.flatten(_.compact(rewards))
    .then ()->

      quests = []

      for quest in @.questRows
        quests[quest.quest_slot_index] = quest

      toReturn =
        quests:quests
        rewards:@.rewards

      Logger.module("QuestsModule").timeEnd "updateQuestProgressWithCompletedChallenge() -> for challenge #{challengeId} by user #{userId.blue}.".green

      return toReturn

  ###*
  # Update quest progress for a user given a completed quest.
  # @public
  # @param  {Promise}    txPromise    Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  tx        KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID for which to process quests.
  # @param   {String}    questId     Quest ID for which to calculate quest progress.
  # @param  {Moment}    systemTime    Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}            Promise that will post { quests:[] rewards:[] } on completion.
  ###
  @updateQuestProgressWithCompletedQuest: (txPromise, tx, userId, gameId, questId, questRows, systemTime) ->

    # userId or questId must be defined
    if !userId or !questId
      return Promise.reject(new Error("Can not update quest progress : invalid user ID - #{userId} - or quest ID - #{questId}"))

    Logger.module("QuestsModule").time "updateQuestProgressWithCompletedQuest() -> for user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    return Promise.resolve()
    .bind {}
    .then ()->
      @.questRows = questRows
      if questRows?.length > 0

        allQueries = []

        for quest in questRows

          try

            # generate a quest model object based on quest ID
            questModel = QuestFactory.questForIdentifier(quest.quest_type_id)

            # a completed quest based quest can not progress itself
            if quest.quest_type_id == questId
              continue

            # check if game and player satisfied this class of quest
            progressAmount = questModel.progressForQuestCompletion(questId)

            if progressAmount > 0

              quest.progress ?= 0
              allQueries.push QuestsModule._setQuestProgress(txPromise,tx,quest,quest.progress + progressAmount,gameId,MOMENT_NOW_UTC)

            else

              Logger.module("QuestsModule").debug "updateQuestProgressWithCompletedQuest() -> quest[#{quest.quest_slot_index}] NOT satisfied: #{questModel.getName()} User #{userId.blue}.".yellow

          catch e

            Logger.module("QuestsModule").debug("updateQuestProgressWithCompletedQuest() -> caught ERROR processing QUEST DATA".red, e)
            return Promise.reject(new Error("ERROR PROCESSING QUEST DATA"))
            break

        return Promise.all(allQueries)

      else

        # no quests, no need to update anything
        return Promise.resolve()

    .then (rewards)-> @.rewards = _.flatten(_.compact(rewards))
    .then ()->

      quests = {}

      for quest in @.questRows
        quests[quest.quest_slot_index] = quest

      toReturn =
        quests:quests
        rewards:@.rewards

      Logger.module("QuestsModule").timeEnd "updateQuestProgressWithCompletedQuest() -> for user #{userId.blue}.".green

      return toReturn

  ###*
  # Update quest progress for a user given a completed challenge.
  # @public
  # @param  {Promise}    txPromise    Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  tx        KNEX transaction to attach this operation to.
  # @param  {String}    userId      User ID for which to process quests.
  # @param   {JSON data}    progressedFactionData   Data for a single faction's progression !!Assumed to have leveled!!
  # @param  {Moment}    systemTime    Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}            Promise that will post { quests:[] rewards:[] } on completion.
  ###
  @updateQuestProgressWithProgressedFactionData: (txPromise, tx, userId, progressedFactionData, systemTime) ->

    # userId or challengeId must be defined
    if !userId
      return Promise.reject(new Error("Can not update quest progress for faction data : invalid user ID - #{userId}"))

    if !progressedFactionData
      return Promise.reject(new Error("Can not update quest progress for faction data : invalid faction data"))

    factionId = progressedFactionData.faction_id

    if !factionId?
      return Promise.reject(new Error("Can not update quest progress for faction data : invalid faction data - missing faction id"))


    Logger.module("QuestsModule").time "updateQuestProgressWithProgressedFactionData() -> for faction id #{factionId} by user #{userId.blue}.".green

    MOMENT_NOW_UTC = systemTime || moment().utc()

    this_obj = {}

    return Promise.all([
      tx("users").where({'id':userId}).first('id').forUpdate()
      tx("user_quests").select().where({'user_id':userId}).forUpdate()
    ])
    .bind {}
    .spread (userRow,questRows)->
      @.userRow = userRow
      @.questRows = questRows
      if questRows?.length > 0
        allQueries = []
        for quest in questRows
          try
            # generate a quest model object based on quest ID
            questModel = QuestFactory.questForIdentifier(quest.quest_type_id)

            # check if game and player satisfied this class of quest
            progressAmount = questModel.progressForProgressedFactionData(progressedFactionData)
            if progressAmount > 0
              quest.progress ?= 0
              allQueries.push QuestsModule._setQuestProgress(txPromise,tx,quest,quest.progress + progressAmount,null,MOMENT_NOW_UTC)
            else
              Logger.module("QuestsModule").debug "updateQuestProgressWithProgressedFactionData() -> quest[#{quest.quest_slot_index}] NOT satisfied: #{questModel.getName()} User #{userId.blue}. Faction id: #{factionId}.".yellow

          catch e
            Logger.module("QuestsModule").debug("updateQuestProgressWithProgressedFactionData() -> caught ERROR processing QUEST DATA".red, e)
            return Promise.reject(new Error("ERROR PROCESSING QUEST DATA"))
            break

        return Promise.all(allQueries)
      else
        # no quests, no need to update anything
        return Promise.resolve()
    .then (rewards)-> @.rewards = _.flatten(_.compact(rewards))
    .then ()->
      quests = []
      for quest in @.questRows
        quests[quest.quest_slot_index] = quest

      toReturn =
        quests:quests
        rewards:@.rewards

      Logger.module("QuestsModule").timeEnd "updateQuestProgressWithProgressedFactionData() -> for faction id #{factionId} by user #{userId.blue}.".green
      return toReturn

  ###*
  # Set quest progress.
  # @private
  # @param  {Promise}    txPromise      Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  tx          KNEX transaction to attach this operation to.
  # @param  {Object}    quest        Quest data.
  # @param   {Number}    progressAmount     What to set the progress to.
  # @param  {String}    gameId         Game ID (if any).
  # @param  {Moment}    systemTime      Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}              Promise.
  ###
  @_setQuestProgress:(txPromise,tx,quest,progressAmount,gameId,systemTime)->

    MOMENT_NOW_UTC = systemTime || moment().utc()

    questModel = QuestFactory.questForIdentifier(quest.quest_type_id)

    rewards = []
    allQueries = []

    # if the quest is already past the completion point just resolve
    if quest.progress >= quest.params.completionProgress
      return Promise.resolve()

    if progressAmount > 0

      quest.progress = progressAmount
      quest.updated_at = MOMENT_NOW_UTC.toDate()

      # Check if a quest has been completed to award gold and clear from current quests
      if quest.progress >= quest.params.completionProgress

        Logger.module("QuestsModule").debug "_setQuestProgress() -> quest[#{quest.quest_slot_index}] COMPLETED at #{quest.progress}/#{quest.params.completionProgress}: #{questModel.getName()}. User #{quest.user_id.blue}. For [G:#{gameId}].".cyan

        # note: completion count used to be used to "ding" quests that can be completed multiple times
        # quest.completion_count ?= 0
        # quest.completion_count += 1

        quest.completed_at = MOMENT_NOW_UTC.toDate()
        quest.progress = quest.params.completionProgress # don't allow progress to go above max (ex: 21/20)

        allQueries.push tx("user_quests").where({user_id:quest.user_id,quest_slot_index:quest.quest_slot_index}).delete()

        completedQuest = _.clone(quest)
        completedQuest.id = generatePushId()

        allQueries.push tx("user_quests_complete").insert(completedQuest)

        reward =
          id:          generatePushId()
          user_id:      quest.user_id
          reward_category:  "quest"
          source_id:      completedQuest.id
          quest_type_id:    completedQuest.quest_type_id
          game_id:      gameId
          gold:        quest.gold
          spirit_orbs:    quest.spirit_orbs
          gift_chests:    questModel.giftChests
          cosmetic_keys:    questModel.cosmeticKeys
          created_at:      quest.completed_at
          is_unread:      true

        rewards.push(reward)

        # insert reward into user table
        if gameId
          allQueries.push(GamesModule._addRewardIdToUserGame(tx,quest.user_id,gameId,reward.id))

        allQueries.push(tx("user_rewards").insert(reward))

        if quest.gold
          # update user gold
          allQueries.push(InventoryModule.giveUserGold(txPromise,tx,quest.user_id,quest.gold,'daily quest',completedQuest.id))

        if quest.spirit_orbs
          # add booster to user
          allQueries.push(InventoryModule.addBoosterPackToUser(txPromise,tx,quest.user_id,1,'daily quest',completedQuest.id))

        if QuestFactory.questForIdentifier(quest.quest_type_id).giftChests?
          # add gift chests to user
          for type in QuestFactory.questForIdentifier(quest.quest_type_id).giftChests
            allQueries.push(GiftCrateModule.addGiftCrateToUser(txPromise, tx, quest.user_id, type))

        if QuestFactory.questForIdentifier(quest.quest_type_id).cosmeticKeys?
          # add cosmetic keys to user
          for cosmeticKeyType in QuestFactory.questForIdentifier(quest.quest_type_id).cosmeticKeys
            # allQueries.push(GiftCrateModule.addGiftCrateToUser(txPromise, tx, quest.user_id, type))
            allQueries.push CosmeticChestsModule.giveUserChestKey(txPromise,tx,quest.user_id,cosmeticKeyType,1,"daily quest",completedQuest.id)

        # Kick off a job to update user's quest achievements
        # TODO: should catch up quests advance achievements
        Jobs.create("update-user-achievements",
          name: "Update User Quest Achievements"
          title: util.format("User %s :: Update Quest Achievements", quest.user_id)
          userId: quest.user_id
          completedQuestId: completedQuest.quest_type_id
        ).removeOnComplete(true).save()

      else

        Logger.module("QuestsModule").debug "_setQuestProgress() -> quest[#{quest.quest_slot_index}] progressed to #{quest.progress}/#{quest.params.completionProgress}: #{questModel.getName()}. User #{quest.user_id.blue}. Game [G:#{gameId}].".cyan

        allQueries.push(
          tx("user_quests").where({'user_id':quest.user_id,'quest_slot_index':quest.quest_slot_index}).update(
            progress:          quest.progress
            progressed_by_game_ids:    quest.progressed_by_game_ids
            updated_at:         quest.updated_at
          )
        )

    # Checks if a quest's progress should be reset, such as in the case of a broken streak
    else if questModel.shouldResetProgress(gameSessionData,progressAmount)

      Logger.module("QuestsModule").debug "_setQuestProgress() -> quest[#{quest.quest_slot_index}] progress is reset: #{questModel.getName()} User #{quest.user_id.blue}. Game [G:#{gameId}].".yellow

      quest.progress = 0
      quest.updated_at = MOMENT_NOW_UTC.valueOf()

      allQueries.push(
        tx("user_quests").where({'user_id':quest.user_id,'quest_slot_index':quest.quest_slot_index}).update(
          progress:0
          updated_at:moment().utc().getDate()
        )
      )

    else

      Logger.module("QuestsModule").debug "_setQuestProgress() -> quest[#{quest.quest_slot_index}] NOT satisfied: #{questModel.getName()} User #{quest.user_id.blue}. Game [G:#{gameId}].".yellow

    return Promise.all(allQueries)
    .bind {}
    .then ()-> @.rewards = rewards
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->

      allPromises = []

      if quest.completed_at
        # remove complete quest from Firebase
        allPromises.push(FirebasePromises.remove(fbRootRef.child("user-quests").child(quest.user_id).child("daily").child("current").child("quests").child(quest.quest_slot_index)))
      else
        slotIndex = quest.quest_slot_index
        # update quest progress in Firebase
        data = _.clone(quest)
        delete data.quest_slot_index
        delete data.user_id
        data.created_at = moment.utc(data.created_at).valueOf()
        data.begin_at = moment.utc(data.begin_at).valueOf()
        if data.mulliganed_at then data.mulliganed_at = moment.utc(data.mulliganed_at).valueOf()
        if data.updated_at then data.updated_at = moment.utc(data.updated_at).valueOf()
        allPromises.push(FirebasePromises.set(fbRootRef.child("user-quests").child(quest.user_id).child("daily").child("current").child("quests").child(slotIndex),data))

        # for reward in @.rewards
        #   reward_id = reward.id
        #   delete reward.user_id
        #   delete reward.id
        #   # push rewards to firebase tree
        #   allPromises.push(FirebasePromises.set(fbRootRef.child("user-rewards").child(userId).child(reward_id),reward))

      return Promise.all(allPromises)
    .then ()-> return @.rewards

  ###*
  # Set quest progress.
  # @private
  # @param  {Promise}    txPromise      Transaction promise that resolves if transaction succeeds.
  # @param  {Transaction}  tx          KNEX transaction to attach this operation to.
  # @param  {String}  userId          User ID to give catch up charge to
  # @param   {Integer}    numCharges       How many charges to give
  # @param  {Moment}    systemTime    Pass in the current system time to use to generate quests. Used only for testing.
  # @return  {Promise}              Promise.
  ###
  @_giveUserCatchUpQuestCharge:(txPromise,tx, userId, numCharges, systemTime)->
    MOMENT_NOW_UTC = systemTime || moment().utc()

    Logger.module("QuestsModule").debug "_giveUserCatchUpQuestCharge() -> User #{userId.blue} receiving #{numCharges} quest catch up charges.".cyan

    this_obj = {}

    return knex("user_quests").transacting(tx).forUpdate().select().where({'user_id':userId})
    .bind this_obj
    .then (userQuestRows) ->
      @.userQuestRows = userQuestRows
      # Find the row for the catchup quest if it exists
      @.userCatchUpQuestRow = _.find(userQuestRows, (userQuestRow) ->
        sdkQuest = QuestFactory.questForIdentifier(userQuestRow.quest_type_id)
        return sdkQuest? && sdkQuest.isCatchUp
      )

      sdkQuest = QuestFactory.questForIdentifier()

      @.needsInsert = false # whether catch up quest row requires insert or update
      if (not @.userCatchUpQuestRow?)
        @.needsInsert = true
        @.userCatchUpQuestRow = QuestsModule._questDataForQuest(QuestFactory.questForIdentifier(QuestCatchUp.Identifier),MOMENT_NOW_UTC)

        @.userCatchUpQuestRow.gold = 0
        @.userCatchUpQuestRow.user_id = userId
        @.userCatchUpQuestRow.quest_slot_index = QuestsModule.CATCH_UP_QUEST_SLOT

      # update gold in the catch up quest's row
      @.needsUpdate = false
      if (@.userCatchUpQuestRow.gold <= QuestsModule.CATCH_UP_MAX_GOLD_VALUE)
        @.needsUpdate = true
        @.userCatchUpQuestRow.gold = Math.min(@.userCatchUpQuestRow.gold + numCharges * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE,QuestsModule.CATCH_UP_MAX_GOLD_VALUE)


      # Write to firebase after transaction is done, if needed
      if @.needsUpdate or @.needsInsert
        txPromise.then () =>
          return DuelystFirebase.connect().getRootRef()
        .then (fbRootRef) =>

          allPromises = []

          fbUserCatchUpQuestData = _.clone(@.userCatchUpQuestRow)
          slotIndex = fbUserCatchUpQuestData.quest_slot_index
          delete fbUserCatchUpQuestData.quest_slot_index
          delete fbUserCatchUpQuestData.user_id
          fbUserCatchUpQuestData.created_at = moment.utc(fbUserCatchUpQuestData.created_at).valueOf()
          fbUserCatchUpQuestData.begin_at = moment.utc(fbUserCatchUpQuestData.begin_at).valueOf()
          if fbUserCatchUpQuestData.mulliganed_at then fbUserCatchUpQuestData.mulliganed_at = moment.utc(fbUserCatchUpQuestData.mulliganed_at).valueOf()
          if fbUserCatchUpQuestData.updated_at then fbUserCatchUpQuestData.updated_at = moment.utc(fbUserCatchUpQuestData.updated_at).valueOf()

          allPromises.push(
            FirebasePromises.set(fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('quests').child(slotIndex),fbUserCatchUpQuestData)
            FirebasePromises.set(fbRootRef.child("user-quests").child(userId).child("daily").child("current").child('updated_at'),MOMENT_NOW_UTC.valueOf())
          )

          return Promise.all(allPromises)

      if @.needsInsert
        Logger.module("QuestsModule").debug "_giveUserCatchUpQuestCharge() -> Inserting new catch up quest for user #{userId.blue}.".cyan
        return knex.insert(@.userCatchUpQuestRow).into("user_quests").transacting(tx)
      else if @.needsUpdate
        Logger.module("QuestsModule").debug "_giveUserCatchUpQuestCharge() -> Updating current catch up quest for user #{userId.blue}.".cyan
        return knex("user_quests").where({'user_id':userId,'quest_slot_index':QuestsModule.CATCH_UP_QUEST_SLOT}).update(@.userCatchUpQuestRow).transacting(tx)
      else
        return Promise.resolve()
    .then () ->
      return @.userCatchUpQuestRow

module.exports = QuestsModule
