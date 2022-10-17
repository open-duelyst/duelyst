###
Job - Update User Ranking
###
config = require '../../config/config.js'
AchievementsModule = require '../../server/lib/data_access/achievements.coffee'
DuelystFirebase = require '../../server/lib/duelyst_firebase_module.coffee'
Logger = require '../../app/common/logger.coffee'
{GameManager} = require '../../server/redis/'
FirebasePromises = require '../../server/lib/firebase_promises.coffee'
Promise = require 'bluebird'


###*
# Job - 'update-user-achievements'
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  userId = job.data.userId || null

  if !userId
    return done(new Error("update-user-achievements: User ID is not defined."))

  Logger.module("JOB").debug("[J:#{job.id}] Update User (#{userId}) Achievements starting")
  Logger.module("JOB").time("[J:#{job.id}] Update User (#{userId}) Achievements")

  # determine achievement type by job data

  ## Game Achievement
  gameId = job.data.gameId || null
  if gameId?
    isUnscored = job.data.isUnscored
    isDraw = job.data.isDraw
    return GameManager.loadGameSession(gameId)
    .then JSON.parse
    .then (gameSessionData) ->
      if !gameSessionData
        throw new Error("Game data is null. Game may have already been archived.")
      else
        return AchievementsModule.updateAchievementsProgressWithGame(userId,gameId,gameSessionData,isUnscored,isDraw)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Crafting Achievement
  craftedCardId = job.data.craftedCardId || null
  if craftedCardId?
    return AchievementsModule.updateAchievementsProgressWithCraftedCard(userId,craftedCardId)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)


  ## Disenchanting Achievement
  disenchantedCardIdList = job.data.disenchantedCardIdList || null
  if disenchantedCardIdList?
    disenchantProgressPromises = []
    for disenchantedCardId in disenchantedCardIdList
      disenchantProgressPromises.push(AchievementsModule.updateAchievementsProgressWithDisenchantedCard(userId,disenchantedCardId))
    return Promise.all(disenchantProgressPromises)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Armory Achievement
  armoryPurchaseSku = job.data.armoryPurchaseSku || null
  if armoryPurchaseSku?
    return AchievementsModule.updateAchievementsProgressWithArmoryPurchase(userId,armoryPurchaseSku)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Referral Achievement
  referralEventType = job.data.referralEventType || null
  if referralEventType?
    return AchievementsModule.updateAchievementsProgressWithReferralEvent(userId,referralEventType)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Faction Achievement
  factionProgressed = job.data.factionProgressed || null
  if factionProgressed
    return DuelystFirebase.connect().getRootRef()
    .bind {}
    .then (fbRootRef) ->
      @.fbRootRef = fbRootRef
      factionProgressionRootRef = @.fbRootRef.child("user-faction-progression").child(userId)
      return FirebasePromises.once(factionProgressionRootRef,"value")
    .then (factionProgressionSnapshot) ->
      factionProgressionData = factionProgressionSnapshot.val()
      return AchievementsModule.updateAchievementsProgressWithFactionProgression(userId,factionProgressionData)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Inventory Achievement
  inventoryChanged = job.data.inventoryChanged || null
  if inventoryChanged
    return DuelystFirebase.connect().getRootRef()
    .bind {}
    .then (fbRootRef) ->
      @.fbRootRef = fbRootRef
      cardCollectionRootRef = @.fbRootRef.child("user-inventory").child(userId).child("card-collection")
      return FirebasePromises.once(cardCollectionRootRef,"value")
    .then (cardCollectionSnapshot) ->
      cardCollectionData = cardCollectionSnapshot.val()
      return AchievementsModule.updateAchievementsProgressWithCardCollection(userId,cardCollectionData)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Loot Crate Achievement
  receivedCosmeticChestType = job.data.receivedCosmeticChestType || null
  if receivedCosmeticChestType?
    return AchievementsModule.updateAchievementsProgressWithReceivedCosmeticChest(userId,receivedCosmeticChestType)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Quest Achievement
  completedQuestId = job.data.completedQuestId || null
  if completedQuestId?
    return AchievementsModule.updateAchievementsProgressWithCompletedQuest(userId,completedQuestId)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Rank Achievement
  achievedRank = job.data.achievedRank || null
  if job.data.achievedRank == 0
    achievedRank = 0
  if achievedRank?
    return AchievementsModule.updateAchievementsProgressWithEarnedRank(userId,achievedRank)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Login Achievement
  lastLoginAt = job.data.lastLoginAt || null
  currentLoginAt = job.data.currentLoginAt || null
  lastLoginVersion = job.data.lastLoginVersion || null
  currentLoginVersion = job.data.currentLoginVersion || null
  if currentLoginAt?
    lastLoginMoment = null
    currentLoginMoment = null
    if lastLoginAt?
      lastLoginMoment = moment.utc(lastLoginAt)
    if currentLoginAt?
      currentLoginMoment = moment.utc(currentLoginAt)
    return AchievementsModule.updateAchievementsProgressWithLogin(userId,lastLoginMoment,currentLoginMoment,lastLoginVersion,currentLoginVersion)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## Opened Spirit Orb Achievement
  spiritOrbOpenedFromSet = job.data.spiritOrbOpenedFromSet || null
  if spiritOrbOpenedFromSet?
    return AchievementsModule.updateAchievementsProgressWithSpiritOrbOpening(userId,spiritOrbOpenedFromSet)
    .then () ->
      Logger.module("JOB").timeEnd("[J:#{job.id}] Update User (#{userId}) Achievements")
      return done()
    .catch (error) ->
      return done(error)

  ## All done with quests, shouldn't reach here
  return done(new Error("Missing data in achievement job"))
