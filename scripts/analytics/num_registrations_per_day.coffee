
###

  num_registrations_per_day - Takes a number of days to look back (assumes 5) and reports how many user registrations occurred per utc day

  Examples:
  num_registrations_per_day 7

###

# region Requires
# Configuration object
config = require("../../config/config.js")
Promise = require 'bluebird'
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
moment = require('moment')
Logger = require '../../app/common/logger.coffee'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../server/lib/users_module")
DuelystFirebase = require("../../server/lib/duelyst_firebase_module")
fbUtil = require '../../app/common/utils/utils_firebase.js'
# endregion Requires

# Resolves to an object filled with key-value pairs of (utc date)->(number of users registered on that date)
# Accepts a number of completed days to look back in time for users (reports current partial day but doesn't count it as one of the lookback days)
num_registrations_per_day = (numDaysToLookBack=5) ->
  startTodayMoment = moment().startOf('day')
  oldestDayToRetrieve = startTodayMoment.subtract(numDaysToLookBack,'days')
  results = {}
  Logger.module("Script").log(("num_registrations_per_day() -> looking back " + numDaysToLookBack + " days").green)

  DuelystFirebase.connect().getRootRef()
  .bind({})
  .then (fbRootRef) ->
    # Retrieves the most recently registered user so we know when we've retrieved all registered users in our range
    @fbRootRef = fbRootRef
    return new Promise( (resolve,reject) ->
      usersRef = fbRootRef.child("users")
      usersRef.orderByChild("createdAt").limitToLast(1).on("child_added", (snapshot) ->
        Logger.module("Script").log(("num_registrations_per_day() -> Most recently registered user id is: " + snapshot.key()).green)
        return resolve(snapshot.key())
      )
    )
  .then (mostRecentRegistrationKey) ->
    usersRef = @fbRootRef.child("users")
    return new Promise( (resolve, reject) ->
      usersRef.orderByChild("createdAt").startAt(oldestDayToRetrieve.valueOf()).endAt(moment().valueOf()).on("child_added", (snapshot) ->
        userCreatedMoment = moment(snapshot.child("createdAt").val())
        resultsKey = userCreatedMoment.format("MMM DD")
        results[resultsKey] = (results[resultsKey] or 0) + 1
        if snapshot.key() == mostRecentRegistrationKey
          Logger.module("Script").log("num_registrations_per_day() -> processed most recently registered user.".green)
          return resolve(results)
      )
    )

# Handle execution as a script
if process.argv[1].toString().indexOf('num_registrations_per_day.coffee') != -1

  if process.argv[2]
    numDaysToLookBack = parseInt(process.argv[2])
    if (isNaN(numDaysToLookBack))
      numDaysToLookBack = undefined

  # Begin script execution
  console.log process.argv

  num_registrations_per_day(numDaysToLookBack)
  .then (results) ->
    Logger.module("Script").log(("num_registrations_per_day() -> results\n" + JSON.stringify(results,null,2)).blue)
    process.exit(1);

module.exports = num_registrations_per_day
