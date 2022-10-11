os = require 'os'
Logger = require '../app/common/logger'
Promise = require 'bluebird'

# Pretty error printing, helps with stack traces
PrettyError = require 'pretty-error'
pe = new PrettyError()
pe.skipNodeFiles()

# Configuration object
config = require '../config/config.js'

###*
# Shutdown server process with an unhandled error
# Will trigger alerts by with exceptionReporter, email
# @public errorShutdown
# @param {Error} err
###
module.exports.errorShutdown = (err) ->
	Logger.module("SHUTDOWN").error pe.render(err)
	process.exit(1)
