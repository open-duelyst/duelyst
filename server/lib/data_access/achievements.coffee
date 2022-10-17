Promise = require 'bluebird'
util = require 'util'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
_ = require 'underscore'
Helpers = require './helpers'
SyncModule = require './sync'
InventoryModule = require './inventory'
CosmeticChestsModule = require './cosmetic_chests'
GiftCrateModule = require './gift_crate'
CONFIG = require '../../../app/common/config.js'
Errors = require '../custom_errors'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'

# SDK imports
SDK = require '../../../app/sdk'
CardFactory = require '../../../app/sdk/cards/cardFactory.coffee'
Rarity = require '../../../app/sdk/cards/rarityLookup.coffee'
Faction = require '../../../app/sdk/cards/factionsLookup.coffee'
GameSession = require '../../../app/sdk/gameSession.coffee'
UtilsGameSession = require '../../../app/common/utils/utils_game_session.coffee'
QuestFactory = require '../../../app/sdk/quests/questFactory.coffee'
QuestType = require '../../../app/sdk/quests/questTypeLookup.coffee'
CosmeticsFactory = require '../../../app/sdk/cosmetics/cosmeticsFactory.coffee'

class AchievementsModule


  ###*
  # Mark an achievement as read.
  # @public
  # @param  {String}    userId      User ID.
  # @param  {String}    achievementId  Achievement ID.
  # @return  {Promise}
  ###
  @markAchievementAsRead: (userId,achievementId)->
    MOMENT_NOW_UTC = moment().utc()
    Logger.module("UsersModule").time "markAchievementAsRead() -> user #{userId.blue} read achievement type #{achievementId}."
    txPromise = knex.transaction (tx)->
      knex("user_achievements").where({'user_id':userId,'achievement_id':achievementId}).update(is_unread:false).transacting(tx)
      .then (updateCount)->
        if updateCount > 0
          return updateCount
        else
          throw new Errors.NotFoundError("Cound not find achievement to mark as read for user")
      .then ()-> return DuelystFirebase.connect().getRootRef()
      .then (rootRef)->
        return FirebasePromises.update(rootRef.child("user-achievements").child(userId).child('completed').child(achievementId), {is_unread: false})
      .then tx.commit
      .catch tx.rollback
      return
    return txPromise

  #  resolves to an array of ids for newly completed achievements
  @updateAchievementsProgressWithGame: (userId, gameId, gameData, isUnscored, isDraw) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithGame() -> Updating game achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForGameDataForPlayerId(gameData,userId,isUnscored)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      Logger.module("AchievementsModule").debug "updateAchievementsProgressWithGame() -> No game achievement progress made for #{userId.blue}".green
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap,gameId)

  @updateAchievementsProgressWithCardCollection: (userId, cardCollection) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithCardCollection() -> Updating card collection achievement progress for #{userId.blue}".green
    # TODO: if no data passed in, retrieve it

    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    allCards = SDK.GameSession.getCardCaches().getCards()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForCardCollection(cardCollection, allCards)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithArmoryPurchase: (userId, armoryTransactionSku) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithArmoryPurchase() -> Updating armory achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForArmoryTransaction(armoryTransactionSku)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithReferralEvent: (userId, eventType) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithReferralEvent() -> Updating achievement progress for #{userId.blue}"
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForReferralEvent(eventType)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithCraftedCard: (userId, craftedCardId) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithCraftedCard() -> Updating crafting achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForCrafting(craftedCardId)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithFactionProgression: (userId, factionProgressionData) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithFactionProgression() -> Updating faction achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForFactionProgression(factionProgressionData)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithDisenchantedCard: (userId, disenchantedCardId) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithDisenchantedCard() -> Updating disenchant achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForDisenchanting(disenchantedCardId)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithCompletedQuest: (userId, completedQuestId) ->
    if _.contains(QuestFactory.questForIdentifier(completedQuestId).types,QuestType.QuestBeginner)
      Logger.module("AchievementsModule").debug "updateAchievementsProgressWithCompletedQuest() -> Skipping due to #{completedQuestId} is beginner for #{userId.blue}".green
      return Promise.resolve()

    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithCompletedQuest() -> Updating quest #{completedQuestId} achievement progress for #{userId.blue}".green

    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForCompletingQuestId(completedQuestId)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithEarnedRank: (userId, earnedRank) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithEarnedRank() -> Updating rank achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForAchievingRank(earnedRank)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithReceivedCosmeticChest: (userId, cosmeticChestType) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithReceivedCosmeticChest() -> Updating cosmetic chest achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForReceivingCosmeticChest(cosmeticChestType)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithLogin: (userId, currentLoginMoment) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithLogin() -> Updating login achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForLoggingIn(currentLoginMoment)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  @updateAchievementsProgressWithSpiritOrbOpening: (userId, spiritOrbOpenedFromSet) ->
    Logger.module("AchievementsModule").debug "updateAchievementsProgressWithSpiritOrbOpening() -> Updating spirit orb opening achievement progress for #{userId.blue}".green
    progressMade = false
    progressMap = {}
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()
    for achievementId,achievement of enabledAchievements
      achievementProgress = achievement.progressForOpeningSpiritOrb(spiritOrbOpenedFromSet)
      if achievementProgress
        progressMap[achievementId] = achievementProgress
        progressMade = true

    if !progressMade
      return Promise.resolve([])
    else
      return @_applyAchievementProgressMapToUser(userId,progressMap)

  #  resolves to an array of ids for newly completed achievements
  @_applyAchievementProgressMapToUser: (userId,progressMap,gameId=null) ->

    Logger.module("AchievementsModule").debug "_applyAchievementProgressMapToUser() -> Updating achievement progress for #{userId.blue}".green
    enabledAchievements = SDK.AchievementsFactory.getEnabledAchievementsMap()

    MOMENT_NOW_UTC = moment().utc()
    this_obj = {}

    txPromise = knex.transaction (tx)->

      return Promise.resolve(tx('users').where('id',userId).first('id').forUpdate())
      .bind this_obj
      .then ()->
        achievementIds = _.keys(progressMap)
        return knex("user_achievements").whereIn('achievement_id',achievementIds).andWhere('user_id',userId).transacting(tx)
      .then (achievementRows)->

        @.updatedAchievements = []
        @.rewards = []
        @.completedAchievementIds = []

        # method that will be used to process the achievements map serially with 1 concurrency so that there's no chance of card log getting overwritten
        processAchievementSerialy = (achievementId)=>

          Logger.module("AchievementsModule").debug "_applyAchievementProgressMapToUser() -> processing achievement #{achievementId} for #{userId.blue}"

          achievementProgress = progressMap[achievementId]
          allPromises = []

          row = _.find achievementRows, (r)-> return r.achievement_id == achievementId
          needsInsert = if row then false else true

          # if this achievement's already done, just move on
          if row?.completed_at
            return Promise.resolve()

          # if the row does not exist, set up the initial data
          row ?=
            user_id:      userId
            achievement_id:    achievementId
            progress:      0
            progress_required:  enabledAchievements[achievementId].progressRequired
            created_at:      MOMENT_NOW_UTC.toDate()
            is_unread:      true

          # mark row progress
          row.progress = Math.min(row.progress + achievementProgress, enabledAchievements[achievementId].progressRequired)

          # if the achievement is complete, process rewards
          if not row.completed_at and row.progress >= enabledAchievements[achievementId].progressRequired

            row.completed_at = MOMENT_NOW_UTC.toDate()
            @.completedAchievementIds.push(achievementId)

            # looks like a completed achievement...
            rewardObject =
              id: generatePushId()
              user_id: userId
              reward_category: 'achievement'
              reward_type: achievementId
              created_at: MOMENT_NOW_UTC.toDate()
              game_id:gameId
              is_unread:true

            row.reward_ids ?= []
            row.reward_ids.push(rewardObject.id)

            for rewardType,rewardValue of SDK.AchievementsFactory.achievementForIdentifier(achievementId).rewards
              # perform any reward conversions needed
              if rewardType == 'spiritOrb'
                rewardObject['spirit_orbs'] = rewardValue
              else if rewardType == 'cards'
                cardIds = []
                for c in rewardValue
                  if parseInt(c)
                    Logger.module("AchievementsModule").debug "_applyAchievementProgressMapToUser() -> giving user card", c
                    cardIds.push(parseInt(c))
                  else if c.count
                    Logger.module("AchievementsModule").debug "_applyAchievementProgressMapToUser() -> giving user cards with data", c
                    factionId = _.sample(c.factionId)
                    rarityId = c.rarity
                    cardSet = c.cardSet || 1
                    cardsForFaction = SDK.GameSession.getCardCaches().getCardSet(cardSet).getFaction(factionId).getRarity(rarityId).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getIsGeneral(false).getCards()
                    cardIdsToSample = c.sample || _.map(cardsForFaction,(c)-> return c.id)
                    cardId = _.sample(cardIdsToSample)
                    for [1..c.count]
                      cardIds.push(cardId)
                rewardObject['cards'] = cardIds
              else if rewardType == 'neutralCommonCard'
                neutralCommonCards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(Faction.Neutral).getRarity(Rarity.Common).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
                randomIndex = _.random(0,neutralCommonCards.length-1)
                rewardedCardId = neutralCommonCards[randomIndex].getId()
                if !rewardObject['cards']
                  rewardObject['cards'] = []
                rewardObject['cards'].push(rewardedCardId)
              else if rewardType == 'neutralRareCard'
                neutralRareCards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(Faction.Neutral).getRarity(Rarity.Rare).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
                randomIndex = _.random(0,neutralRareCards.length-1)
                rewardedCardId = neutralRareCards[randomIndex].getId()
                if !rewardObject['cards']
                  rewardObject['cards'] = []
                rewardObject['cards'].push(rewardedCardId)
              else if rewardType == 'neutralEpicCard'
                neutralEpicCards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(Faction.Neutral).getRarity(Rarity.Epic).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
                randomIndex = _.random(0,neutralEpicCards.length-1)
                rewardedCardId = neutralEpicCards[randomIndex].getId()
                if !rewardObject['cards']
                  rewardObject['cards'] = []
                rewardObject['cards'].push(rewardedCardId)
              else if rewardType == 'neutralLegendaryCard'
                neutralLegendaryCards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(Faction.Neutral).getRarity(Rarity.Legendary).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
                randomIndex = _.random(0,neutralLegendaryCards.length-1)
                rewardedCardId = neutralLegendaryCards[randomIndex].getId()
                if !rewardObject['cards']
                  rewardObject['cards'] = []
                rewardObject['cards'].push(rewardedCardId)
              else if rewardType == 'factionLegendaryCard'
                factionLegendaryCards = _.filter(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getRarity(Rarity.Legendary).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards(), (card) ->
                  return card.getFactionId() != Faction.Neutral
                )
                randomIndex = _.random(0,factionLegendaryCards.length-1)
                rewardedCardId = factionLegendaryCards[randomIndex].getId()
                if !rewardObject['cards']
                  rewardObject['cards'] = []
                rewardObject['cards'].push(rewardedCardId)
              else if rewardType == 'gauntletTicket'
                rewardObject['gauntlet_tickets'] = rewardValue
              else if rewardType == 'gold'
                rewardObject[rewardType] = rewardValue
              else if rewardType == 'spirit'
                rewardObject[rewardType] = rewardValue
              else if rewardType == 'cosmetics'
                rewardObject[rewardType] = rewardValue
              else if rewardType == 'bronzeCrateKey'
                rewardObject['cosmetic_keys'] ?= []
                for i in [1..rewardValue]
                  rewardObject['cosmetic_keys'].push(SDK.CosmeticsChestTypeLookup.Common)
              else if rewardType == 'giftChests'
                rewardObject['gift_chests'] ?= []
                for type in rewardValue
                  rewardObject['gift_chests'].push(type)

            if rewardObject.gold then allPromises.push InventoryModule.giveUserGold(txPromise,tx,userId,rewardObject.gold,'achievement',achievementId)
            if rewardObject.spirit then allPromises.push InventoryModule.giveUserSpirit(txPromise,tx,userId,rewardObject.spirit,'achievement',achievementId)
            if rewardObject.cards then allPromises.push(InventoryModule.giveUserCards(txPromise,tx,userId,rewardObject.cards,"achievement",achievementId))
            if rewardObject.spirit_orbs then allPromises.push InventoryModule.addBoosterPackToUser(txPromise,tx,userId,1,'achievement',achievementId)
            if rewardObject.gauntlet_tickets then allPromises.push InventoryModule.addArenaTicketToUser(txPromise,tx,userId,'achievement',achievementId)
            if rewardObject.cosmetics
              for cosmeticId in rewardObject.cosmetics
                allPromises.push InventoryModule.giveUserCosmeticId(txPromise, tx, userId, cosmeticId, "achievement reward", achievementId,null, MOMENT_NOW_UTC)
            if rewardObject.cosmetic_keys
              for keyType in rewardObject.cosmetic_keys
                allPromises.push CosmeticChestsModule.giveUserChestKey(txPromise, tx, userId, keyType, 1, "achievement reward", achievementId, MOMENT_NOW_UTC)
            if rewardObject.gift_chests
              for type in rewardObject.gift_chests
                allPromises.push(GiftCrateModule.addGiftCrateToUser(txPromise, tx, userId, type,achievementId,MOMENT_NOW_UTC))

            # random un-owned cosmetic needs special handling
            if rewardType == 'newRandomCosmetics'
              for cosmeticParams in rewardValue
                allPromises.push InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, "achievement reward", achievementId, cosmeticParams.rarity, cosmeticParams.type, null, MOMENT_NOW_UTC).then (cosmeticReward)=>
                  if cosmeticReward? and cosmeticReward.cosmetic_id?
                    rewardObject.cosmetics ?= []
                    rewardObject.cosmetics.push(cosmeticReward.cosmetic_id)
                  if cosmeticReward.spirit?
                    rewardObject.spirit ?= 0
                    rewardObject.spirit += cosmeticReward.spirit

                  @.rewards.push rewardObject
                  return tx("user_rewards").insert(rewardObject)
            else if rewardType == 'mythronCard'
              allPromises.push AchievementsModule.giveMythronCard(txPromise,tx,userId,achievementId).then (rewardedCardId)=>
                if !rewardObject['cards']
                  rewardObject['cards'] = []
                rewardObject['cards'].push(rewardedCardId)
                return tx("user_rewards").insert(rewardObject)
            else
              @.rewards.push rewardObject
              allPromises.push tx("user_rewards").insert(rewardObject)

          # save to database
          if needsInsert

            # insert the achievement into the database?
            allPromises.push knex('user_achievements').insert(row).transacting(tx)
            @.updatedAchievements.push(row)

          else

            row.updated_at = MOMENT_NOW_UTC.toDate()
            # update the achievement in the database
            allPromises.push knex('user_achievements').where({
              'user_id':userId,
              'achievement_id':achievementId
            }).update({
              progress:    row.progress
              completed_at:  row.completed_at
              updated_at:    row.updated_at
              reward_ids:    row.reward_ids
            }).transacting(tx)
            @.updatedAchievements.push(row)

          return Promise.all(allPromises)

        # process the achievements map serially with 1 concurrency so that there's no chance of card log getting overwritten
        return Promise.map _.keys(progressMap), processAchievementSerialy, { concurrency: 1}
      .then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
      .timeout(10000)
      .catch Promise.TimeoutError, (e)->
        Logger.module("AchievementsModule").error "_applyAchievementProgressMapToUser() -> ERROR, operation timeout for u:#{userId} g:#{gameId}"
        throw e

    .bind this_obj
    # because achievements can have rewards, to avoid a race condition we write to FB outside the transaction after all the data / rewards have been writtan and are ready to read via REST API
    .then ()-> return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef)->

      allPromises = []

      # for reward in @.rewards

      #   reward_id = reward.id
      #   delete reward.id
      #   delete reward.user_id
      #   allPromises.push FirebasePromises.set(fbRootRef.child("user-rewards").child(userId).child(reward_id),Helpers.restifyData(reward))

      for row in @.updatedAchievements

        sdkAchievement = SDK.AchievementsFactory.achievementForIdentifier(row.achievement_id)

        if sdkAchievement.tracksProgress
          progressData = _.extend({},row)
          delete progressData.user_id
          delete progressData.reward_ids
          delete progressData.is_unread

          allPromises.push FirebasePromises.update(fbRootRef.child("user-achievements").child(userId).child("progress").child(row.achievement_id),Helpers.restifyData(progressData))

        if row.completed_at
          completionData = _.extend({},row)
          delete completionData.user_id
          delete completionData.progress
          delete completionData.progress_required

          # allPromises.push FirebasePromises.remove(fbRootRef.child("user-achievements").child(userId).child("progress").child(row.achievement_id))
          allPromises.push FirebasePromises.set(fbRootRef.child("user-achievements").child(userId).child("completed").child(row.achievement_id),Helpers.restifyData(completionData))

      return Promise.all(allPromises)

    return txPromise

  @giveMythronCard: (txPromise, tx, userId, achievementId) ->
    return tx('user_card_collection').first('cards').where('user_id',userId)
    .bind {}
    .then (card_collection_data) ->
      mythronCards = SDK.GameSession.getCardCaches().getRarity(Rarity.Mythron).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(false).getCards()
      unownedMythronCards = []
      for mythronCard in mythronCards
        if !(card_collection_data.cards[mythronCard.getId()]) or card_collection_data.cards[mythronCard.getId()]?.count < 1
          unownedMythronCards.push(mythronCard)

      # if we found any unowned non-prismatic mythron cards, pick one to award
      if unownedMythronCards.length > 0
        randomIndex = _.random(0,unownedMythronCards.length-1)
        rewardedCardId = unownedMythronCards[randomIndex].getId()
      # if player owns all non-prismatic mythron cards, give a random prismatic one
      else
        mythronCards = SDK.GameSession.getCardCaches().getRarity(Rarity.Mythron).getIsUnlockable(false).getIsCollectible(true).getIsPrismatic(true).getCards()
        randomIndex = _.random(0,mythronCards.length-1)
        rewardedCardId = mythronCards[randomIndex].getId()
      @rewardedCardId = rewardedCardId
      return rewardedCardId
    .then (rewardedCardId) ->
      Promise.all([
        InventoryModule.giveUserCards(txPromise,tx,userId,[rewardedCardId],"achievement",achievementId)
      ])
    .then () ->
      Promise.resolve(@rewardedCardId)

module.exports = AchievementsModule
