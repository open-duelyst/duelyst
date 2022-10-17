os = require 'os'
Logger = require '../app/common/logger'
StackLogger = require './lib/stack_logger.coffee'
Promise = require 'bluebird'

# Configuration object
config = require '../config/config.js'

###*
# Shutdown server process with an unhandled error
# @public errorShutdown
# @param {Error} err
###
module.exports.errorShutdown = (err) ->
  Logger.module("SHUTDOWN").error StackLogger.render(err)
  process.exit(1)
