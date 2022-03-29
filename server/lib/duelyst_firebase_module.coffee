Promise = require 'bluebird'
Firebase = require 'firebase'
Logger = require '../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
util = require 'util'
_ = require 'underscore'
url = require 'url'

# Configuration object
config = require '../../config/config.js'

if config.get('firebaseLoggingEnabled')
	Firebase.enableLogging(true)

class DuelystFirebaseModule

	# Connection objects keyed by URL
	@connections: {}

	# Connect to a Firebase URL, returns connection if already exists
	@connect: (firebaseUrl = config.get('firebase'), firebaseToken = config.get('firebaseToken')) ->
		parsed = url.parse(firebaseUrl)
		key = url.format(parsed)

		# Logger.module("DuelystFirebaseModule").debug "connect() -> connecting to #{key}".magenta

		# TODO: check token expiration!
		# TODO: check for a new token being passed in for same key
		if @connections[key]?
			# Logger.module("DuelystFirebaseModule").debug "connect() -> existing connection for #{key}".green
			return @connections[key]

		@connections[key] = new DuelystFirebaseModule(
			key: key
			firebaseUrl: firebaseUrl
			firebaseToken: firebaseToken
		)

	# Count current number of connections
	@getNumConnections: ->
		_.size(@connections)

	# Opens new connections
	constructor: ({@key, @firebaseUrl, @firebaseToken}) ->
		Logger.module("DuelystFirebaseModule").debug "connect() -> new connection to #{@key}".magenta
		@promise = new Promise (resolve, reject) =>
			connection = new Firebase(@firebaseUrl)
			connection.authWithCustomToken @firebaseToken, (error, result) =>
				if error?
					Logger.module("DuelystFirebaseModule").debug "auth() -> authentication FAILED.".red
					return reject(error)
				else
					Logger.module("DuelystFirebaseModule").debug "auth() -> authentication SUCCESS.".green
					@authData = result
					@tokenExpires = result.expires
					return resolve(connection)
		@promise.catch (error) =>
			delete DuelystFirebaseModule.connections[@key]

	# Returns a Promise with the Firebase root reference
	getRootRef: ->
		@promise

module.exports = DuelystFirebaseModule
