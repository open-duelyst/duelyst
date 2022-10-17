# Boots up a basic HTTP server on port 8080
# Responds to /health endpoint with status 200
# Otherwise responds with status 404

Logger     = require '../app/common/logger.coffee'
http     = require 'http'
url     = require 'url'
os = require 'os'
Promise    = require 'bluebird'
config = require '../config/config'
knex     = require '../server/lib/data_access/knex'

MAX_QUEUED_ALLOWED = 25

poolStats = (pool) ->
  stats = {
    size: pool.getPoolSize()
    min: pool.getMinPoolSize()
    max: pool.getMaxPoolSize()
    available: pool.availableObjectsCount()
    queued: pool.waitingClientsCount()
  }
  return stats

healthcheck = () ->
  server = http.createServer (req, res) ->
    pathname = url.parse(req.url).pathname
    if pathname == '/health'
      Logger.module("MATCHMAKER").debug "HTTP health check : /health requested."
      pool = poolStats(knex.client.pool)
      Promise.all([
        knex("knex_migrations").select("migration_time").orderBy("id","desc").limit(1)
      ])
      .timeout(5000)
      .spread (row)->
        if pool.queued >= MAX_QUEUED_ALLOWED
          res.statusCode = 500
        else
          res.statusCode = 200
      .catch Promise.TimeoutError, (e)->
        res.statusCode = 500
      .catch (e)->
        res.statusCode = 500
      .finally ()->
        res.write(JSON.stringify({pool: pool}))
        res.end()
    else
      # Logger.module("MATCHMAKER").debug "HTTP health check: 404 bad request received."
      res.statusCode = 404
      res.end()

  server.listen 8080, () ->
    Logger.module("MATCHMAKER").debug "HTTP health check : running on port 8080 /health."

module.exports = healthcheck
