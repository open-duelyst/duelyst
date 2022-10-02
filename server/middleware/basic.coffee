express = require 'express'
bodyParser = require 'body-parser'
helmet = require 'helmet'
cors = require 'cors'
morgan = require 'morgan'
colors = require 'colors'
compose = require('compose-middleware').compose
Logger = require 'app/common/logger'
config = require 'config/config'
getRealIp = require 'express-real-ip'

# Request logger, gets request logstream from Morgan and sends to console
requestLogger = (message) ->
	# Strip newline
	if config.get('expressLoggingEnabled')
		Logger.module("EXPRESS").log message.replace(/[\n]/g, "")

if config.isDevelopment() or config.isStaging()
	parser = bodyParser.json({limit: '10mb'})
else
	parser = bodyParser.json()

# Build CORS domain allowlist for staging/production.
corsAllowedOrigins = []
apiDomain = config.get('apiDomain')
if apiDomain
	corsAllowedOrigins.push apiDomain
cdnDomain = config.get('assetsBucket.domainName')
if cdnDomain
	corsAllowedOrigins.push cdnDomain

# Enable CORS allowlist in staging/production.
if config.isDevelopment()
	corsMiddleware = cors()
else
	Logger.module("API").warn "Enabling CORS for domains #{JSON.stringify(corsAllowedOrigins)}"
	corsMiddleware = cors(
		origin: (origin, callback) ->
			if corsAllowedOrigins.indexOf(origin) != -1
				callback(null, true)
			else
				callback(new Error("The origin #{origin} was blocked by CORS configuration."))
	)

module.exports = compose([
	getRealIp(),
	# Enable CORS
	corsMiddleware,
	# Disable client cache headers
	helmet.noCache(),
	# Security headers
	helmet.xssFilter(),
	# Body parser and urlencoded
	parser,
	bodyParser.urlencoded({extended: true}),
	# apache log format
	morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {stream: {write: requestLogger}})
])
