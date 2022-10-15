###
# Middleware for dealing with server errors
# Should be included in app.use last
###
Logger = require '../../app/common/logger'
config = require '../../config/config'

# Disabling PE because it results in logs like this:
#
# [0m  [0m
# [0m  [0m[90m-[0m [0m[93mreadable[0m[90m:[0m[93m228[0m[37m [0m[37mTLSSocket.Readable.push[0m
# [0m  [0m  [0m[90mnode:internal/streams/readable:228:10[0m
# [0m  [0m
# [0m  [0m[90m-[0m [0m[93mstream_base_commons[0m[90m:[0m[93m190[0m[37m [0m[37mTLSWrap.onStreamRead[0m
# [0m  [0m  [0m[90mnode:internal/stream_base_commons:190:23[0m
# [0m  [0m
# [0m
#
# Pretty error printing, helps with stack traces
#PrettyError = require 'pretty-error'
#pe = new PrettyError()
#pe.skipNodeFiles()
#pe.skipPackage('express')

# first error middleware: internal console.logger
# prints errors to console with pretty print stacktrace
module.exports.logError = (err, req, res, next) ->
	# ensure err.status is set
	err.status = err.status || 500

	# don't log 4xx outside of localdev
	if (config.get('env') != 'development' && err.status >= 400 && err.status <= 500)
		return next(err)

	# log other errors
	Logger.module("EXPRESS").log "ERROR: #{err.status} #{err.message} for client #{req.ip}"
	#Logger.module("EXPRESS").log pe.render(err)
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
