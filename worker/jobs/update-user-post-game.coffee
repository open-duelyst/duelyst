###
Job - Update User Progression
###
_ = require 'underscore'
config = require '../../config/config.js'
Logger = require '../../app/common/logger.coffee'
Promise = require 'bluebird'
colors = require 'colors'
util = require 'util'
GameType = require '../../app/sdk/gameType'
GameStatus = require '../../app/sdk/gameStatus'
UtilsGameSession = require 'app/common/utils/utils_game_session'
FactionFactory = require '../../app/sdk/cards/factionFactory'

Errors = require '../../server/lib/custom_errors'
RankModule = require '../../server/lib/data_access/rank'
UsersModule = require '../../server/lib/data_access/users'
CosmeticChestsModule = require '../../server/lib/data_access/cosmetic_chests'
GauntletModule = require '../../server/lib/data_access/gauntlet'
RiftModule = require '../../server/lib/data_access/rift'
GamesModule = require '../../server/lib/data_access/games'
QuestsModule = require '../../server/lib/data_access/quests'

{Redis, Jobs, GameManager} = require '../../server/redis/'

###*
# Start processing quests for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Integer} generalId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessQuests = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  if !isUnscored and gameSessionData?
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing quests ...")
    return QuestsModule.updateQuestProgressWithGame(userId,gameId,gameSessionData)
  else
    return Promise.resolve()

###*
# Start processing ranked/gauntlet game outcome for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Integer} generalId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessGameType = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData,ticketId)->
  if gameType == GameType.Ranked
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing rank ...")
    return RankModule.userNeedsSeasonStartRanking(userId)
    .then (needsCycle)->
      if needsCycle
        return RankModule.cycleUserSeasonRanking(userId)
      else
        return Promise.resolve()
    .then ()->
      return RankModule.updateUserRankingWithGameOutcome(userId,isWinner,gameId,isDraw)
  else if gameType == GameType.Gauntlet
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing gauntlet outcome ...")
    return GauntletModule.updateArenaRunWithGameOutcome(userId,isWinner,gameId,isDraw)
  else if gameType == GameType.Rift
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing rift outcome ...")
    playerData = UtilsGameSession.getPlayerDataForId(gameSessionData,userId)
    damageDealt = 0
    if playerData.totalDamageDealtToGeneral > 0
      # If a player won, and they did less than 25 damage to enemy general, give them 25 credit
      if playerData.isWinner and (playerData.totalDamageDealtToGeneral < 25)
        damageDealt = 25
      else
        damageDealt = playerData.totalDamageDealtToGeneral
    return RiftModule.updateRiftRunWithGameOutcome(userId,ticketId,isWinner,gameId,isDraw,damageDealt,gameSessionData)
  else if gameType == GameType.SinglePlayer and isWinner
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing single player outcome ...")
    # single player games should CREATE a faction xp record for the opponent faction if one already does not exist
    opponentSetupData = _.find gameSessionData.gameSetupData.players,(p)-> return p.playerId != userId
    opponentFactionId = opponentSetupData.factionId
    if opponentFactionId != factionId
      # ensure opponent faction is a playable faction before making record for player
      playableFactions = FactionFactory.getAllPlayableFactions()
      playableOpponentFaction = _.find(playableFactions, (factionData) -> factionData.id == opponentFactionId)
      if playableOpponentFaction?
        whenCreated = UsersModule.createFactionProgressionRecord(userId,opponentFactionId,gameId,gameType)
        .catch Errors.AlreadyExistsError, (e)->
          # silently catch already exist errors and move on
        return whenCreated
    return Promise.resolve()
  else
    return Promise.resolve()

###*
# Start processing progression data for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Integer} generalId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessProgression = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  if gameType == GameType.SinglePlayer or gameType == GameType.Friendly or gameType == GameType.Rift
    return Promise.resolve()
  else if gameType == GameType.BossBattle
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing boss progression ...")
    return UsersModule.updateUserBossProgressionWithGameOutcome(userId,opponentId,isWinner,gameId,gameType,isUnscored,isDraw,gameSessionData)
  else
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing progression ...")
    return UsersModule.updateUserProgressionWithGameOutcome(userId,opponentId,isWinner,gameId,gameType,isUnscored,isDraw)

###*
# Start processing loot crate awarding for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Integer} generalId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessLootCrates = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  if gameType == GameType.SinglePlayer or gameType == GameType.Friendly or gameType == GameType.Rift
    return Promise.resolve()
  else if gameType == GameType.BossBattle
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing loot crates ...")
    return CosmeticChestsModule.updateUserChestRewardWithBossGameOutcome(userId,isWinner,gameId,gameType,isUnscored,isDraw,gameSessionData)
  else
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing loot crates ...")
    return CosmeticChestsModule.updateUserChestRewardWithGameOutcome(userId,isWinner,gameId,gameType,isUnscored,isDraw)

###*
# Start processing faction xp for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessFactionXp = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  if gameType != GameType.Rift
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing faction xp ...")
    return UsersModule.updateUserFactionProgressionWithGameOutcome(userId,factionId,isWinner,gameId,gameType,isUnscored,isDraw)
  else
    return Promise.resolve()

###*
# Start processing game counters for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Integer} generalId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessGameCounters = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing game counters ...")
  return UsersModule.updateGameCounters(userId,factionId,generalId,isWinner,gameType,isUnscored,isDraw)

###*
# Start processing stats for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessStats = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  if gameType == GameType.SinglePlayer or gameType == GameType.BossBattle or !gameSessionData?
    return Promise.resolve()
  else
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> processing stats ...")
    return UsersModule.updateUserStatsWithGame(userId,gameId,gameType,gameSessionData)

###*
# Start processing achievements for user.
# @param  {Object} job        Kue job
# @param  {String} userId        User ID
# @param  {String} gameId        Game ID
# @param  {Integer} factionId
# @param  {Integer} generalId
# @param  {Boolean} isWinner
# @param  {Boolean} isDraw
# @param  {Boolean} isUnscored
# @param  {String} gameType      Type of game 'ranked','friendly',etc.. (see GameType)
# @param  {Object} gameSessionData  Game Session data loaded from REDIS
# @return  {Promise}          Promise that resolves whan this process is complete.
###
onProcessAchievements = (job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData)->
  if gameType != GameType.SinglePlayer
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> starting achievements job ...")
    Jobs.create("update-user-achievements",
      name: "Update User Game Achievements"
      title: util.format("User %s :: Update Game Achievements", userId)
      userId: userId
      gameId: gameId
      isDraw: isDraw
      isUnscored: isUnscored
    ).removeOnComplete(true).save()
  return Promise.resolve()

###*
# Job - 'update-user-post-game'
# This job will sequentially/serially update user data for a game in several phases: 'quests','progression','faction xp', etc..
# Any individual phase failure will not affect others, but the job will fail at the end if any of the phases do.
# @param  {Object} job    Kue job
# @param  {Function} done   Callback when job is complete
###
module.exports = (job, done) ->
  gameId = job.data.gameId || null
  userId = job.data.userId || null
  opponentId = job.data.opponentId || null
  factionId = job.data.factionId || null
  generalId = job.data.generalId || null
  isWinner = job.data.isWinner
  isDraw = job.data.isDraw
  isUnscored = job.data.isUnscored || false
  isBotGame = job.data.isBotGame || false
  ticketId = job.data.ticketId || null
  gameType = job.data.gameType

  if !gameId
    return done(new Error("Game ID is not defined."))
  if !userId
    return done(new Error("User ID is not defined."))
  if !factionId
    return done(new Error("factionId is not defined."))
  # isWinner may no longer be null, expect true or false
  if !isWinner?
    return done(new Error("isWinner is not defined."))
  if !gameType
    return done(new Error("Game type is not defined."))

  thisObj = {}

  Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> STARTING... #{gameType} winner:#{isWinner} unscored:#{isUnscored} draw:#{isDraw}".cyan)

  logSignature = "[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> DONE - #{gameType} winner:#{isWinner} unscored:#{isUnscored} draw:#{isDraw}".green
  Logger.module("JOB").time(logSignature)

  return GamesModule.updateUserGame(userId,gameId,{status:GameStatus.over, is_scored:!isUnscored, is_winner:isWinner, is_draw:isDraw, is_bot_game:isBotGame})
  .bind thisObj
  .then ()->
    Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> loading game session data ...")
    # grab game session data from REDIS
    return GameManager.loadGameSession(gameId)
    .bind thisObj
    .then JSON.parse # parse game session data to JSON
    .then (gameSessionData) ->
      Logger.module("JOB").debug("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> loading game session data ... DONE")
      @.gameSessionData = gameSessionData
      return gameSessionData
  .then (gameSessionData)-> # process game promises

    # if the game session data is not available
    if not gameSessionData
      # log out a warning that some processes will fail
      Logger.module("JOB").error("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> ERROR: game session data is null. Will not be able to process quests / stats.")

    # this strange structure will loop through an array of functions sequentially (one-by-one)
    # each function will kick off a processing phase and return a promise
    return Promise.each([
      { name:"quests", func: onProcessQuests },
      { name:"game_type", func: onProcessGameType },
      { name:"progression", func: onProcessProgression },
      { name:"loot_crates", func: onProcessLootCrates },
      { name:"faction_xp", func: onProcessFactionXp },
      { name:"game_counters", func: onProcessGameCounters },
      { name:"stats", func: onProcessStats },
      { name:"achievements", func: onProcessAchievements }
    ], (item) ->
      # call the process function, and watch for errors on the returned promise
      item?.func(job,userId,opponentId,gameId,factionId,generalId,isWinner,isDraw,isUnscored,gameType,gameSessionData,ticketId)
      .bind thisObj
      .catch (e)->
        # if we catch an error, add it to the retained error object, and log out some info
        @.errors ?= []
        @.errors.push(e)
        Logger.module("JOB").debug "[J:#{job.id}]", e.stack
        Logger.module("JOB").error("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> error processing part '#{item?.name}' ", e?.message)
    )

  .then ()->
    # done with all processes! check the retained errors object to find if any of the processes failed
    if @.errors?.length
      # throw the first error
      throw @.errors[0]
    # otherwise all good
    Logger.module("JOB").timeEnd(logSignature)
    # mark KUE job as done
    done()
  # .timeout 15000
  .catch Promise.TimeoutError, (e)->
    # custom logging for promise timeout errors
    Logger.module("JOB").error("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> TIMEOUT.")
    done(e)
  .catch (e)->
    # log out and fail the job on an error
    Logger.module("JOB").error("[J:#{job.id}] update-user-post-game (#{userId} - #{gameId}) -> FAILED! #{e?.message}")
    # mark KUE job as done with ERROR
    done(e)
