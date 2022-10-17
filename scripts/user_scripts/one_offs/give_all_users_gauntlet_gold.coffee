
###

  give_all_users_gauntlet_gold - Gives all current accounts 2k gold

  Examples: (no parameters required)
  give_all_users_gauntlet_gold

###

# region Requires
# Configuration object
config = require("../../../config/config.js")
Promise = require 'bluebird'
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
moment = require('moment')
Logger = require '../../../app/common/logger.coffee'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../../server/lib/users_module")
DuelystFirebase = require("../../../server/lib/duelyst_firebase_module")
fbUtil = require '../../../app/common/utils/utils_firebase.js'
# endregion Requires

rewardKey = "gauntlet_gold"
walletReward = {gold_amount:300}

# Resolves to an object filled with key-value pairs of (utc date)->(number of users registered on that date)
# Accepts a number of completed days to look back in time for users (reports current partial day but doesn't count it as one of the lookback days)
give_all_users_gauntlet_gold = () ->
  results = {usersGivenReward:0,usersAlreadyGivenReward:0}

  DuelystFirebase.connect().getRootRef()
  .bind({})
  .then (fbRootRef) ->
    # Retrieves the most recently registered user so we know when we've given all users reward
    @fbRootRef = fbRootRef
    return new Promise( (resolve,reject) ->
      usersRef = fbRootRef.child("users")
      usersRef.orderByChild("createdAt").limitToLast(1).on("child_added", (snapshot) ->
        Logger.module("Script").log(("give_all_users_gauntlet_gold() -> Most recently registered user id is: " + snapshot.key()).green)
        return resolve(snapshot.key())
      )
    )
  .then (mostRecentRegistrationKey) ->
    usersRef = @fbRootRef.child("users")
    return new Promise( (resolve, reject) ->
      usersRef.orderByChild("createdAt").on("child_added", (snapshot) ->
        userId = snapshot.key()
        UsersModule.giveUserReward(userId,rewardKey,walletReward)
        .then (wasGivenReward) ->
          Logger.module("Script").log("give_all_users_gauntlet_gold() -> processed most recently registered user.".green)
          if wasGivenReward
            results.usersGivenReward += 1
          else
            results.usersAlreadyGivenReward += 1
          if userId == mostRecentRegistrationKey
            return resolve(results)
      )
    )

# Begin script execution
console.log process.argv

give_all_users_gauntlet_gold()
.then (results) ->
  Logger.module("Script").log(("give_all_users_gauntlet_gold() -> completed").blue)
  Logger.module("Script").log(("give_all_users_gauntlet_gold() -> completed, gave #{results.usersGivenReward} users reward").blue)
  Logger.module("Script").log(("give_all_users_gauntlet_gold() -> completed, #{results.usersAlreadyGivenReward} users already had reward\n").blue)
  process.exit(1);

