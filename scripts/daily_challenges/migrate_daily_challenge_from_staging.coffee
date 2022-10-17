

###

  migrate_daily_challenge_from_staging - Transfers a daily challenge for a provided date from staging to the current NODE_ENV


  Example:
  # show usage
  migrate_daily_challenge_from_staging
  # Actually wipe the data and commit transactions
  coffee migrate_daily_challenge_from_staging fbStagingToken utc_date_key
  coffee migrate_daily_challenge_from_staging ahjsdasjhdgasdjh 2016-05-02
  coffee migrate_daily_challenge_from_staging ahjsdasjhdgasdjh 2016-05-02 force # Will overwrite if there is a challenge already at that date


###

config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
moment = require('moment')
fbRef = new Firebase(config.get("firebase"))
util = require('util')
fs = require('fs')
FirebasePromises = require('../../server/lib/firebase_promises')
DuelystFirebase = require("../../server/lib/duelyst_firebase_module")
Promise = require("bluebird")
colors = require("colors")
Logger = require '../../app/common/logger.coffee'
fetch = require 'isomorphic-fetch'
UtilsEnv = require("../../app/common/utils/utils_env")
zlib     = require 'zlib'

# create a S3 API client
AWS     = require "aws-sdk"
AWS.config.update
  accessKeyId: config.get("s3_archive.key")
  secretAccessKey: config.get("s3_archive.secret")
s3 = new AWS.S3()
Promise.promisifyAll(s3)

allowOverwrite = false
ignoreQAReady = false

migrateFromStagingToCurrentEnvironment = (stagingToken,dateKey)->
  stagingURL = "https://duelyst-staging.firebaseio.com/"
  return Promise.all([
    DuelystFirebase.connect(stagingURL,stagingToken).getRootRef(),
    DuelystFirebase.connect().getRootRef()
  ])
  .bind({})
  .spread (stagingRootRef,localRootRef) ->
    Logger.module("Script").log "Connection made to staging and NODE firebase environments"
    @.stagingRootRef = stagingRootRef
    @.localRootRef = localRootRef

    # Get challenge from staging
    return Promise.all([
      FirebasePromises.once(@.stagingRootRef.child("daily-challenges").child(dateKey),"value")
      FirebasePromises.once(@.localRootRef.child("daily-challenges").child(dateKey),"value")
    ])
  .spread (stagingDailyChallengeSnapshot,localDailyChallengeSnapshot) ->
    Logger.module("Script").log "Retrieved data from staging for daily challenge at #{dateKey}"
    @.stagingDailyChallengeSnapshot = stagingDailyChallengeSnapshot
    @.localDailyChallengeSnapshot = localDailyChallengeSnapshot

    if not @.stagingDailyChallengeSnapshot? or not @.stagingDailyChallengeSnapshot.val()?
      Logger.module("Script").log "No challenge found at date key (#{dateKey}) on staging"
      return Promise.reject(new Error("No challenge found at date key (#{dateKey}) on staging"))

    if @.localDailyChallengeSnapshot? and @.localDailyChallengeSnapshot.val()?
      if not allowOverwrite
        Logger.module("Script").log "A challenge already exists at date key (#{dateKey}) on target environment (use force to overwrite)"
        return Promise.reject(new Error("A challenge already exists at date key (#{dateKey}) on target environment (use force to overwrite)"))

    @.dailyChallengeData = @.stagingDailyChallengeSnapshot.val()
    Logger.module("Script").log "Data at staging for daily challenge at #{dateKey} is:\n #{JSON.stringify(@.dailyChallengeData,null,2)}"

    if not @.dailyChallengeData.isQAReady and not ignoreQAReady
      return Promise.reject(new Error("Challenge at date key (#{dateKey}) not marked as passing QA"))

    if not @.dailyChallengeData.url?
      return Promise.reject(new Error("No challenge url found at date key (#{dateKey}) on staging"))

    stagingChallengeURL = @.dailyChallengeData.url

    Logger.module("Script").log "Fetching challenge game data from url:\n" + stagingChallengeURL
    return Promise.resolve(fetch(stagingChallengeURL))
  .then (res)->
    Logger.module("Script").log "Completed fetching challenge game data"
    if res.ok
      return res.json()
    else
      err = new Error(res.statusText)
      err.status = res.status
      throw err
  .then (data) ->
    Logger.module("Script").log "Challenge game data ready to send to target\n" + JSON.stringify(data,null,2)
    Promise.promisifyAll(zlib)

    return zlib.gzipAsync(JSON.stringify(data))
  .then (gzipGameSessionData) ->
    Logger.module("Script").log "Completed zipping challenge game data"
    @.gzipGameSessionData = gzipGameSessionData

    env = null

    # Set up the new url
    env = null
    if (UtilsEnv.getIsInLocal())
      env = "local"
    else if (UtilsEnv.getIsInStaging())
      return Promise.reject(new Error("Cannot migrate from staging to staging."))
    else if (UtilsEnv.getIsInProduction())
      env = "production"
    else
      return Promise.reject(new Error("Unknown/Invalid ENV for storing Daily Challenge"))

    bucket = "duelyst-challenges"

    filename = env + "/" + dateKey + ".json"
    @.dailyChallengeData.url = "https://s3-us-west-2.amazonaws.com/" + bucket + "/" + filename

    params =
      Bucket: bucket
      Key: filename
      Body: @.gzipGameSessionData
      ACL: 'public-read'
      ContentEncoding: "gzip"
      ContentType: "text/json"

    return s3.putObjectAsync(params)
  .then () ->
    Logger.module("Script").log "Completed pushing snapshot to new location"
    return FirebasePromises.set(@.localRootRef.child("daily-challenges").child(dateKey),@.dailyChallengeData)
  .then () ->
    Logger.module("Script").log "Migration complete"

# Begin script execution
console.log process.argv

if process.argv.length != 4 and process.argv.length != 5
  # Show usage
  console.log("usage:")
  console.log("coffee migrate_daily_challenge_from_staging staging_key utc_date_key [force]")
  process.exit(1);


fbStagingToken = process.argv[2]
utcDateKey = process.argv[3]

if process.argv.length == 5
  if process.argv[4] == "force"
    allowOverwrite = true
    ignoreQAReady = true
  else
    console.log(process.argv[4])
    console.log("usage:")
    console.log("coffee migrate_daily_challenge_from_staging staging_key utc_date_key [force]")
    process.exit(1);

migrateFromStagingToCurrentEnvironment(fbStagingToken,utcDateKey)
.then () ->
  Logger.module("Script").log "Finished migrating daily challenge from staging to NODE_ENV environment"
  process.exit(1)
.catch (error) ->
  Logger.module("Script").log "Error: " + error.toString()
  process.exit(1)



