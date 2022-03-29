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

# Enable CORS
# Disable client cache headers
# Security headers
# Body parser and urlencoded

module.exports = compose([
	getRealIp(),
	cors(),
	helmet.noCache(),
	helmet.xssFilter(),
	parser,
	bodyParser.urlencoded({extended: true}),
	# apache log format
	morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {stream: {write: requestLogger}})
])
