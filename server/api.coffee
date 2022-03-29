###
Starts main application
###
os = require 'os'
fs = require 'fs'
path = require 'path'
mkdirp = require 'mkdirp'
request = require 'request'
Promise = require 'bluebird'
Logger = require '../app/common/logger'
exceptionReporter = require '@counterplay/exception-reporter'
shutdown = require './shutdown'
librato = require './lib/librato'
mail = require './mailer'
Promise.promisifyAll(mail)

# Setup http server and express app
app = require "./express"
server = require('http').createServer(app)

# Pretty error printing, helps with stack traces
PrettyError = require 'pretty-error'
pe = new PrettyError()
pe.skipNodeFiles()

# Configuration object
config = require '../config/config.js'

if config.isDevelopment()
	Logger.module("SERVER").log "DEV MODE: enabling long stack support"
	process.env.BLUEBIRD_DEBUG = 1
	Promise.longStackTraces()

# Methods to download assets from S3
# TODO : Put in module
makeDirectory = (cb) ->
	mkdirp (__dirname + '/../public/' + config.get('env')), (err) ->
		if err? then cb err
		else cb null

getIndexHtml = (url, cb) ->
	request(url: url + '/index.html', gzip: true)
	.on 'error', (err) ->
		cb err
	.on 'response', (res) ->
		if res.statusCode != 200
			cb new Error("request returned status #{res.statusCode}")
	.pipe fs.createWriteStream(__dirname + '/../public/' + config.get('env') + '/index.html')
	.on 'error', (err) ->
		cb err
	.on 'finish', () ->
		cb null

getRegisterHtml = (url, cb) ->
	request(url: url + '/register.html', gzip: true)
	.on 'error', (err) ->
		cb err
	.on 'response', (res) ->
		if res.statusCode != 200
			cb new Error("request returned status #{res.statusCode}")
	.pipe fs.createWriteStream(__dirname + '/../public/' + config.get('env') + '/register.html')
	.on 'error', (err) ->
		cb err
	.on 'finish', () ->
		cb null

setupDevelopment = () ->
	server.listen config.get('port'), () ->
		server.connected = true
		Logger.module("SERVER").log "Duelyst '#{config.get('env')}' started on port #{config.get('port')}"

setupProduction = () ->
	makeDirectory (err) ->
		if err?
			Logger.module("SERVER").log "setupDirectory() failed: " + err
			exceptionReporter.notify(err, { severity: "error" })
			process.exit(1)
		else
			getIndexHtml config.get('s3_url'), (err) ->
				if err?
					Logger.module("SERVER").log "getIndexHtml() failed: " + err
					exceptionReporter.notify(err, { severity: "error" })
					process.exit(1)
				else
					getRegisterHtml config.get('s3_url'), (err) ->
						if err?
							Logger.module("SERVER").log "getIndexHtml() failed: " + err
							exceptionReporter.notify(err, { severity: "error" })
							process.exit(1)
						server.listen config.get('port'), () ->
							server.connected = true
							Logger.module("SERVER").log "Duelyst '#{config.get('env')}' started on port #{config.get('port')}"

###
Setup a domain to catch any errors
###
d = require('domain').create()

# Unhandled Error Catch All aka 'crash'
# Will notify exceptionReporter, send email alert, then shutdown
d.on 'error', shutdown.errorShutdown

# Any unhandled sync/async error in the following code *execution* will be handled by domain
d.run () ->
	# Start up server in development/production mode
	if config.isDevelopment()
		setupDevelopment()
	if config.isProduction()
		setupProduction()
