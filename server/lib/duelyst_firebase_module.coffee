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

# Read service account credentials.
try
  # Development mode uses a local JSON file containing credentials.
  if config.isDevelopment()
    firebaseServiceAccount = require('../../serviceAccountKey.json')
  # Staging/Production mode pulls secrets from AWS SSM into the environment.
  # https://github.com/firebase/firebase-admin-node/blob/v11.0.1/src/app/credential-internal.ts#L167L174
  else
    firebaseServiceAccount = {
      project_id: config.get('firebase.projectId'),
      client_email: config.get('firebase.clientEmail'),
      private_key: config.get('firebase.privateKey'),
    }
    if !firebaseServiceAccount.project_id
      throw new Error('FIREBASE_PROJECT_ID must be set!')
    if !firebaseServiceAccount.client_email
      throw new Error('FIREBASE_CLIENT_EMAIL must be set!')
    if !firebaseServiceAccount.private_key
      throw new Error('FIREBASE_PRIVATE_KEY must be set!')
catch error
  Logger.module('Firebase').error "Failed to read Firebase credentials: #{error}"
  firebaseServiceAccount = {}

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

  # Gracefully disconnect from Firebase.
  @disconnect: (url) ->
    if @apps[url]?
      Logger.module('Firebase').log "disconnecting from #{url}"
      @apps[url].promise.then (deletable) ->
        deletable.delete().then (error) ->
          Logger.module('Firebase').error "failed to delete: #{error.toString()}"
      delete DuelystFirebaseModule.apps[url]
    else
      Logger.module('Firebase').log "already disconnected from #{url}"

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

        # Initialize the database before resolving.
        db = app.database()
        ref = db.ref()
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
        Logger.module('Firebase').error "failed to get ref: #{e.toString()}"

module.exports = DuelystFirebaseModule
