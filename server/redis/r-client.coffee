Promise = require 'bluebird'
redis = require 'ioredis'

Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'

Promise.promisifyAll(redis)

# Configure Redis client
redisHost = config.get('redis.host')
redisPort = config.get('redis.port')
Logger.module("REDIS").info "redis: connecting to server #{redisHost}:#{redisPort}"
module.exports = RedisClient = new redis({
	host: redisHost,
	port: redisPort,
	connectTimeout: 1000,
	retryStrategy: (attempts) ->
		# Attempt reconnection with gradual backoff up to 5000ms.
		backoff = Math.min(attempts * 200, 5000)
		return backoff
})

# redis auth
redisPassword = config.get("redis.password")
if redisPassword
	RedisClient.auth(redisPassword)

# Ready event fires when a connection is ready for use.
RedisClient.on "ready", () ->
	Logger.module("REDIS").log "redis: connection ready"

# Connect event fires when a connection is established.
RedisClient.on "connect", () ->
	Logger.module("REDIS").log "redis: connection established"

# Reconnecting event
RedisClient.on "reconnecting", () ->
	Logger.module("REDIS").warn "redis: reconnecting"

# Error event
# No need to manually reconnect; will happen in automatically.
RedisClient.on "error", (error) ->
	Logger.module("REDIS").error "redis error: #{JSON.stringify(error)})"
