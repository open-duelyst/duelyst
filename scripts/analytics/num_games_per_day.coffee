
###

  num_games_per_day - Takes a number of days to look back (assumes 5) and reports how many games occurred per utc day

  Examples:
  num_games_per_day 7

###

# region Requires
# Configuration object
config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
moment = require('moment')
Logger = require '../../app/common/logger.coffee'
Promise = require 'bluebird'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../server/lib/users_module")
DuelystFirebase = require("../../server/lib/duelyst_firebase_module")
fbUtil = require '../../app/common/utils/utils_firebase.js'
# endregion Requires

# Resolves to an object filled with key-value pairs of (utc date)->(number of games played on that date)
# Accepts a number of completed days to look back in time (reports current partial day but doesn't count it as one of the lookback days)
num_games_per_day = (numDaysToLookBack=5) ->
  startTodayMoment = moment().startOf('day')
  oldestDayToRetrieve = startTodayMoment.subtract(numDaysToLookBack,'days')
  results = {}
  Logger.module("Script").log(("num_games_per_day() -> looking back " + numDaysToLookBack + " days").green)

  DuelystFirebase.connect().getRootRef()
  .bind({})
  .then (fbRootRef) ->
    # Retrieves the most recently created game so we know when we've retrieved all data in our range
    @fbRootRef = fbRootRef
    return new Promise( (resolve,reject) ->
#      usersRef = fbRootRef.child("games-data").child("alpha")
      gamesRef = fbRootRef.child("games-data").child(config.get("env"))
      gamesRef.orderByChild("createdAt").limitToLast(1).on("child_added", (snapshot) ->
        Logger.module("Script").log(("num_games_per_day() -> Most recently created game key is: " + snapshot.key()).green)
        return resolve(snapshot.key())
      )
    )
  .then (mostRecentGameKey) ->
    gamesRef = @fbRootRef.child("games-data").child(config.get("env"))
    return new Promise( (resolve, reject) ->
      gamesRef.orderByChild("createdAt").startAt(oldestDayToRetrieve.valueOf()).endAt(moment().valueOf()).on("child_added", (snapshot) ->
        userCreatedMoment = moment(snapshot.child("createdAt").val())
        resultsKey = userCreatedMoment.format("MMM DD")
        results[resultsKey] = (results[resultsKey] or 0) + 1
        if snapshot.key() == mostRecentGameKey
          Logger.module("Script").log("num_games_per_day() -> processed most recently created game.".green)
          return resolve(results)
      )
    )

# Handle execution as a script
if process.argv[1].toString().indexOf('num_games_per_day.coffee') != -1

  if process.argv[2]
    numDaysToLookBack = parseInt(process.argv[2])
    if (isNaN(numDaysToLookBack))
      numDaysToLookBack = undefined

  # Begin script execution
  console.log process.argv

  num_games_per_day(numDaysToLookBack)
  .then (results) ->
    Logger.module("Script").log(("num_games_per_day() -> results\n" + JSON.stringify(results,null,2)).blue)
    process.exit(1);

module.exports = num_games_per_day
