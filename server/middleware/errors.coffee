###
# Middleware for dealing with server errors
# Should be included in app.use last
###
os = require 'os'
Logger = require '../../app/common/logger'
config = require '../../config/config'
Errors = require '../lib/custom_errors'
Promise = require 'bluebird'
mail = require '../mailer'
Promise.promisifyAll(mail)

# Pretty error printing, helps with stack traces
PrettyError = require 'pretty-error'
pe = new PrettyError()
pe.skipNodeFiles()
pe.skipPackage('express')

# first error middleware: internal console.logger
# prints errors to console with pretty print stacktrace
module.exports.logError = (err, req, res, next) ->
	# ensure err.status is set
	err.status = err.status || 500
	Logger.module("EXPRESS").log "ERROR: #{err.status} #{err.message}  #{req.ip}".red

	# just plainlog 401,404, no need for full stacktrace
	if (err.status == 401 || err.status == 404)
		return next(err)

	# fancy log other errors
	Logger.module("EXPRESS").log pe.render(err)
	return next(err)

# last error middleware: either development or production
# ends the request and sends the error back by HTML or JSON

# development prints full stack trace and does not modify error message
module.exports.development = (err, req, res, next) ->
	# ensure err.status is set
	err.status = err.status || 500
	res.status(err.status)
	return res.format({
		'text/html': () ->
			res.render(__dirname + "/../templates/error.hbs",{
				title: err.status + ' - ' + err.message
				description: err.description
				stack: err.stack
			})
		'application/json': () ->
			res.json({error: err.message})
	})

# production sets a default error message and scrubs stacktrace
module.exports.production = (err, req, res, next) ->
	error = {}

	# check for 400,401,404, otherwise we have 500 error
	# we scrub the error to a default msg
	if err.status == 400 || err.status == 401 || err.status == 404
		error.status = err.status
		error.message = err.message
		error.description = err.description
	else
		error.status = 500
		error.message = 'Internal Server Error.'
		error.description = "Sorry, we've experienced an error."

		# Server info to include with email alert
		serverInfo = {
			hostname: os.hostname()
			environment: config.get('env')
		}
		# Send an email alert
		mail.sendErrorAlertAsync(serverInfo, err)

	res.status(error.status)
	return res.format({
		'text/html': () ->
			res.render(__dirname + "/../templates/error.hbs",{
				title: error.message
				description: error.description
			})
		'application/json': () ->
			res.json({error: error.message})
	})
