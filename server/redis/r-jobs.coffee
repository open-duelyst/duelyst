kue = require 'kue'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get('env')
redisIp = config.get("redis.ip")
redisPort = config.get("redis.port")
redisPassword = config.get("redis.password")

###*
# 'Jobs'
# Exports the Kue createQueue factory
# Note that Kue manages its own Redis connections
# We must pass the prefix and connection settings
###
module.exports = Jobs = kue.createQueue(
	prefix: "#{env}:q"
	disableSearch: true
	redis:
		port: config.get("redis.port")
		host: config.get("redis.ip")
		auth: config.get("redis.password")
)
