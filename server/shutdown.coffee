os = require 'os'
Logger = require '../app/common/logger'
Promise = require 'bluebird'
mail = require './mailer'
Promise.promisifyAll(mail)

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

	if config.isDevelopment()
		process.exit(1)

	# Server info to include with email alert
	serverInfo = {
		hostname: os.hostname()
		environment: config.get('env')
		freemem: os.freemem()
		totalmem: os.totalmem()
	}

	return mail.sendCrashAlertAsync(serverInfo, err)
	.timeout 2500
	.then () ->
		Logger.module("SHUTDOWN").debug "Email alert sent."
	.catch () ->
		Logger.module("SHUTDOWN").error "Failed to send email alert."
	# Ghetto fix: give Winston 1s to send buffered log to Papertrail before exiting
	.delay 1000
	.then () ->
		process.exit(1)
