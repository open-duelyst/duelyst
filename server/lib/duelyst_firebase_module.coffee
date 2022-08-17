Promise = require 'bluebird'
firebaseAdmin = require 'firebase-admin'
colors = require 'colors'
moment = require 'moment'
util = require 'util'
_ = require 'underscore'
url = require 'url'

Logger = require '../../app/common/logger.coffee'
config = require '../../config/config.js'
defaultFirebaseUrl = config.get('firebase.url')
firebaseLoggingEnabled = config.get('firebase.loggingEnabled')
firebaseServiceAccount = require('../../serviceAccountKey.json')

class DuelystFirebaseModule
	# App objects keyed by URL
	@apps: {}

	# Connect to a Firebase URL, returns connection if already exists
	@connect: (firebaseUrl = defaultFirebaseUrl) ->
		# Check for an existing connection on this URL.
		# TODO: check token expiration, new tokens from callers, etc.
		key = url.format(url.parse(firebaseUrl))
		if @apps[key]?
			return @apps[key]

		# Create a new connection.
		@apps[key] = new DuelystFirebaseModule(
			key: key,
			firebaseUrl: firebaseUrl,
		)

	# Count current number of connections
	@getNumConnections: ->
		_.size(@apps)

	# Opens new connections
	constructor: ({@key, @firebaseUrl}) ->
		Logger.module('Firebase').log "connect() -> new app connection with db #{@key}"
		@promise = new Promise (resolve, reject) =>
			# Validate configuration before attempting to connect.
			if @firebaseUrl == ''
				return reject(new Error('firebase.url must be set'))

			if firebaseLoggingEnabled
				firebaseAdmin.database.enableLogging(true)

			try
				app = firebaseAdmin.initializeApp({
					credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
					databaseURL: @firebaseUrl
				}, @firebaseUrl)
				resolve(app)
			catch e
				return reject(new Error('failed to initialize firebase app: ' + e))

		@promise.catch (error) =>
			delete DuelystFirebaseModule.apps[@key]

	# Returns a Promise with the Firebase root reference
	getRootRef: ->
		@promise
		.then (app) ->
			try
				db = app.database()
				return db.ref()
			catch e
				Logger.module('Firebase').error "getRootRef: #{e.toString()}"

module.exports = DuelystFirebaseModule
