kue = require 'kue'
Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
env = config.get('env')

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
    host: config.get("redis.host")
    auth: config.get("redis.password")
  # Promotion options determine the behavior of Kue's internal timers:
  # https://github.com/Automattic/kue/blob/v0.11.6/lib/kue.js#L146L157
  promotion:
    timeout: 1000 # Default value.
    lockTtl: 2000 # Default value.
    limit: 1000 # Default value.
)
