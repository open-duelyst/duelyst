#
Promise = require 'bluebird'
Logger = require('../../app/common/logger')
generatePushId = require('../../app/common/generate_push_id')

#
GameType = require '../../app/sdk/gameType'
RarityFactory = require '../../app/sdk/cards/rarityFactory'
RankFactory = require '../../app/sdk/rank/rankFactory'

# redis
Redis = require '../../server/redis/'
rankedQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked'})
rankedDeckValueQueue = new Redis.PlayerQueue(Redis.Redis, {name:'ranked-deck-value'})

addSomePlayers = (c=1)->
  Logger.module("SIMULATION").log "adding #{c} players"
  for [0...c]
    token = Redis.TokenManager.create({
      userId: generatePushId()
      deck: []
      factionId: 1
      gameType: GameType.Ranked
      rank: 30 # Math.round(Math.random() * 30)
      deckValue: 0 # Math.round(Math.random() * 10)
    })

    division = RankFactory.rankedDivisionAssetNameForRank(token.rank/10)?.toLowerCase()

    Logger.module("SIMULATION").log "adding #{division} player (#{token.rank},#{token.deckValue})"

    Promise.all([
      Redis.TokenManager.add(token)
      rankedQueue.add(token.userId,token.rank)
      rankedDeckValueQueue.add(token.userId,token.deckValue)
      rankedQueue.velocity("")
      Redis.Jobs.create('matchmaking-search-ranked', {
        name: "Ranked Matchmaking Search"
        title: 'GAME :: #{token.userId} searching for game'
        userId: token.userId
        name: token.name
        gameType: GameType.Ranked
        tokenId: token.id
        rank: token.rank
        deckValue: token.deckValue
      }).removeOnComplete(true).save();
    ]).catch (e)->
      Logger.module("SIMULATION").log "ERROR adding player",e


startWorker = ()->

  # Job Queue Consumer // aka Worker
  kue = require 'kue'

  # Setup Kue connection
  # prefix namespaces the queue
  worker = Redis.Jobs

  # Start Kue GUI
  kue.app.listen(3000)
  Logger.module("WORKER").log('UI started on port 3000')

  # job failed
  worker.on "job failed", (id, errorMessage) ->
    Logger.module("WORKER").log "[J:#{id}] has failed: #{errorMessage}".red

  ###
  When using delayed jobs, we must also check the delayed jobs with a timer,
  promoting them if the scheduled delay has been exceeded. This setInterval
  is defined within Queue#promote(ms,limit), defaulting to a check of
  top 200 jobs every 5 seconds. If you have a cluster of kue processes,
  you must call .promote in just one (preferably master) process or
  promotion race can happen.
  ###
  worker.promote(1000)

  ###
  Kue Shutdown Event
  Finishes current job, 10s timeout before shutting down.
  ###
  cleanShutdown = () ->
    worker.shutdown (err) ->
      if err
        Logger.module("WORKER").log "Shutdown error occured: #{err.message}"
      Logger.module("WORKER").log "Shutting down."
      process.exit(0)
    , 10000

  process.on "SIGTERM", cleanShutdown
  process.on "SIGINT",  cleanShutdown
  process.on "SIGHUP",  cleanShutdown
  process.on "SIGQUIT", cleanShutdown
  process.on "SIGABRT", cleanShutdown

  matchmakingSearchRanked = require '../../worker/jobs/matchmaking-search-ranked.coffee'
  worker.process('matchmaking-search-ranked', matchmakingSearchRanked)

# start worker
startWorker();

# add players
setTimeout(addSomePlayers,1000)
