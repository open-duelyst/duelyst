os = require 'os'
Logger = require '../app/common/logger'
Promise = require 'bluebird'

# Configuration object
config = require '../config/config.js'

###*
# Shutdown server process with an unhandled error
# @public errorShutdown
# @param {Error} err
###
module.exports.errorShutdown = (err) ->
  Logger.module("SHUTDOWN").error err.stack
  process.exit(1)
