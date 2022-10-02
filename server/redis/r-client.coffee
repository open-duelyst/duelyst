Promise = require 'bluebird'
Logger = require '../../app/common/logger.coffee'

# Configure Redis
redis = require 'redis'
config = require '../../config/config.js'
redisIp = config.get("redis.ip")
redisPort = config.get("redis.port")
redisPassword = config.get("redis.password")

# promisifyAll
Promise.promisifyAll(redis)

# redis client
module.exports = RedisClient = redis.createClient({host: redisIp, port: redisPort, detect_buffers: true})

# redis auth
if redisPassword
	RedisClient.auth(redisPassword)

# Ready event
RedisClient.on "ready", () ->
	Logger.module("REDIS").debug "client onReady"

# Connect event
RedisClient.on "connect", () ->
	Logger.module("REDIS").debug "client onConnect"

# Error event
# TODO: We should probably do something if we receive an error
RedisClient.on "error", (error) ->
	Logger.module("REDIS").error "client onError: #{JSON.stringify(error)})"
