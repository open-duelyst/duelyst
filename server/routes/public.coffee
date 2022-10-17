path = require 'path'
os = require 'os'
prettyjson = require 'prettyjson'
express = require 'express'
helmet = require 'helmet'
moment = require 'moment'
_ = require 'underscore'
Logger = require '../../app/common/logger.coffee'
Errors = require '../lib/custom_errors'
knex = require '../lib/data_access/knex'
Promise = require 'bluebird'
{Redis,SRankManager,RiftManager} = require '../redis'
config = require '../../config/config.js'
env = config.get('env')
{version} = require '../../version'

router = express.Router()

poolStats = (pool) ->
  stats = {
    size: pool.getPoolSize()
    min: pool.getMinPoolSize()
    max: pool.getMaxPoolSize()
    available: pool.availableObjectsCount()
    queued: pool.waitingClientsCount()
  }
  return stats

serveIndex = (req, res) ->
  # set no cache header
  res.setHeader('Cache-Control', 'no-cache')
  # serve index.html file
  if config.isDevelopment()
    res.sendFile path.resolve(__dirname + "/../../dist/src/index.html")
  # Staging/Production mode uses index.html from S3
  else
    res.sendFile path.resolve(__dirname + "/../../public/" + env + "/index.html")

serveRegister = (req, res) ->
  # set no cache header
  res.setHeader('Cache-Control', 'no-cache')
  # serve index.html file
  if config.isDevelopment()
    res.sendFile path.resolve(__dirname + "/../../dist/src/register.html")
  # Staging/Production mode uses register.html from S3
  else
    res.sendFile path.resolve(__dirname + "/../../public/" + env + "/register.html")

# Setup routes for production / development mode
# Development mode uses index.html from /dist folder
if config.isDevelopment()
  Logger.module("EXPRESS").log "Configuring for DEVELOPMENT environment #{env}".yellow

  # Serve enter /dist/src folder
  router.use express.static(__dirname + "/../../dist/src", {etag: false, lastModified: false, maxAge: 0})

  # Serve main index page /dist/src/index.html
  router.get "/", serveIndex
  router.get "/game", serveIndex
  router.get "/register", serveRegister
  router.get "/login", serveRegister
  router.post "/", serveIndex
else
  Logger.module("EXPRESS").log "Configuring for PRODUCTION environment #{env}".cyan

  # temporarily disabled to allow iframing
  # router.get "/", helmet.frameguard('deny'), serveIndex
  router.get "/", serveIndex
  router.get "/game", serveIndex
  router.get "/register", serveRegister
  router.get "/login", serveRegister
  router.post "/", serveIndex

# /version
router.get "/version", (req, res) ->
  res.json({ version: version })

# /srank
router.get "/srank_ladder", (req, res) ->
  startOfSeasonMonth = moment.utc().startOf('month')
  SRankManager.getTopLadderUserIds(startOfSeasonMonth,50)
  .then (topPlayerIds) ->
    # TODO: Needs validation that this maintains order
    return Promise.map(topPlayerIds,(playerId) ->
      return knex.first('username').from('users').where('id',playerId)
    )
  .then (topPlayerRows) ->
    topPlayerNames = _.map(topPlayerRows,(row) -> return row.username)
    res.json(topPlayerNames)

# /rift_ladder
router.get "/rift_ladder", (req, res) ->
  RiftManager.getTopLadderUserIdAndRunIds(50)
  .then (topUserAndRunIds) ->
    return Promise.map(topUserAndRunIds,(userAndRunId) ->
      if not userAndRunId?
        return Promise.reject("Top Rift Ladder: Invalid user:run id: #{userAndRunId}")
      userRunIdTuple = userAndRunId.split(":")
      if (userRunIdTuple == null or userRunIdTuple.length != 2)
        return Promise.reject("Top Rift Ladder: Error parsing user:run id: #{userAndRunId}")
      userId = userRunIdTuple[0]
      ticketId = userRunIdTuple[1]
      return Promise.all([
        knex.first('username').from('users').where('id',userId),
        knex.first().from("user_rift_runs").where("user_id",userId).andWhere("ticket_id",ticketId)
      ]).spread (userNameRow,userRiftRun) ->
        if (userNameRow? and userRiftRun?) # Only needed in case a user's data is wiped, but good safety check to have
          return Promise.resolve({
            username: userNameRow.username
            faction_id: userRiftRun.faction_id
            general_id: userRiftRun.general_id
          })
        else
          return Promise.resolve(null)
    )
  .then (topPlayerDataRows) ->
    topPlayerDataRows = _.filter(topPlayerDataRows, (row) -> return row != null)
    for i in [0...topPlayerDataRows.length]
      topPlayerDataRows[i].rank = i+1
    res.json(topPlayerDataRows)

# /healthcheck
# Simple HTTP/200 response for use with load balancer health checks.
router.get "/healthcheck", (req, res) ->
  res.status(200).send("OK")

# /health
# Comprehensive health check taking DB connection pool status into account.
router.get "/health", (req, res) ->
  MAX_QUEUED_ALLOWED = 25
  pool = poolStats(knex.client.pool)
  Promise.all([
    knex("knex_migrations").select("migration_time").orderBy("id","desc").limit(1)
  ])
  .timeout(5000)
  .spread (row)->
    if pool.queued >= MAX_QUEUED_ALLOWED
      res.status(500)
    else
      res.status(200)
    res.json({pool: pool})
  .catch Promise.TimeoutError, (e)->
    res.status(500).json({ message: "db timeout" })
  .catch (e)->
    res.status(500).json({ message: "db error" })

# /stats
router.get "/stats", (req, res) ->
  serverId = os.hostname()
  getPlayers = Redis.hgetAsync("servers:#{serverId}", "players")
  getGames = Redis.hgetAsync("servers:#{serverId}", "games")

  Promise.join getPlayers, getGames, (players, games) ->
    res.json({ players: players, games: games, pool: poolStats(knex.client.pool) })

router.get "/replay", (req, res, next) ->
  # replay id from query string params
  replayId = req.query["replayId"] || null
  # where to grab the javascript version
  # use staging CDN in development / testing
  urlOrigin = config.get('cdn')
  if !urlOrigin?
    urlOrigin = window.location.origin

  knex("user_replays").where('replay_id',replayId).first()
  .then (replay)->
    if replay?
      res.render(__dirname + "/../templates/replay.hbs",{
        gameVersionAssetBucket: "#{urlOrigin}/v#{replay.version}"
      })
    else
      throw new Errors.NotFoundError("Replay #{replayId} not found")
  .catch (e)->
    next(e)

module.exports = router
