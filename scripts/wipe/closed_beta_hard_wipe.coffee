
###

  closed_beta_hard_wipe - Wipes all users inventories and gives them gold based on current gold + 100g per booster pack


  Examples: (no parameters required)
  # Does nothing
  closed_beta_hard_wipe
  # Actually wipe the data
  closed_beta_hard_wipe commit_wipe


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
FirebasePromises = require("../../server/lib/firebase_promises.coffee")
# endregion Requires

# Resolves to a results object filled with data representing the results of the wipe
closed_beta_hard_wipe = () ->
  results = {}

  DuelystFirebase.connect().getRootRef()
  .bind({})
  .then (fbRootRef) ->
    @fbRootRef = fbRootRef
    treeRemovalPromises = []

    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe trees").green)

#    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('games-data'))) // too big error
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-aggregates')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-arena-run')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-challenge-progression')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-decks')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-faction-progression')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-games')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-inventory')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-logs')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-matchmaking-errors')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-new-player-progression')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-news')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-progression')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-quests')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-ranking')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-rewards')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-stats')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-transactions')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('job-queues')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('matchmaking')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('news')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('telemetry')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('transactions-in-progress')))

    return Promise.all(treeRemovalPromises)

    # The following is preferable but untested because the above worked out
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-aggregates").green)
#    FirebasePromises.remove(@fbRootRef.child('user-aggregates'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-aggregates").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-arena-run").green)
#    FirebasePromises.remove(@fbRootRef.child('user-arena-run'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-arena-run").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-challenge-progression").green)
#    FirebasePromises.remove(@fbRootRef.child('user-challenge-progression'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-challenge-progression").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-decks").green)
#    FirebasePromises.remove(@fbRootRef.child('user-decks'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-decks").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-faction-progression").green)
#    FirebasePromises.remove(@fbRootRef.child('user-faction-progression'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-faction-progression").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-games").green)
#    FirebasePromises.remove(@fbRootRef.child('user-games'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-games").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-inventory").green)
#    FirebasePromises.remove(@fbRootRef.child('user-inventory'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-inventory").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-logs").green)
#    FirebasePromises.remove(@fbRootRef.child('user-logs'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-logs").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-matchmaking-errors").green)
#    FirebasePromises.remove(@fbRootRef.child('user-matchmaking-errors'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-matchmaking-errors").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-new-player-progression").green)
#    FirebasePromises.remove(@fbRootRef.child('user-new-player-progression'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-new-player-progression").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-news").green)
#    FirebasePromises.remove(@fbRootRef.child('user-news'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-news").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-progression").green)
#    FirebasePromises.remove(@fbRootRef.child('user-progression'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-progression").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-quests").green)
#    FirebasePromises.remove(@fbRootRef.child('user-quests'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-quests").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-ranking").green)
#    FirebasePromises.remove(@fbRootRef.child('user-ranking'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-ranking").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-rewards").green)
#    FirebasePromises.remove(@fbRootRef.child('user-rewards'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-rewards").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-stats").green)
#    FirebasePromises.remove(@fbRootRef.child('user-stats'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-stats").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe user-transactions").green)
#    FirebasePromises.remove(@fbRootRef.child('user-transactions'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping user-transactions").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe job-queues").green)
#    FirebasePromises.remove(@fbRootRef.child('job-queues'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping job-queues").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe matchmaking").green)
#    FirebasePromises.remove(@fbRootRef.child('matchmaking'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping matchmaking").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe news").green)
#    FirebasePromises.remove(@fbRootRef.child('news'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping news").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe telemetry").green)
#    FirebasePromises.remove(@fbRootRef.child('telemetry'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping telemetry").green)
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Beginning to wipe transactions-in-progress").green)
#    FirebasePromises.remove(@fbRootRef.child('transactions-in-progress'))
#  .then () ->
#    Logger.module("Script").log(("closed_beta_hard_wipe() -> Completed wiping transactions-in-progress").green)

  .then () ->

    # Next we need to give all users currently registered 1000 gold
    # Retrieves the most recently registered user so we know when we've given all users reward
    fbRootRef = @fbRootRef
    return new Promise( (resolve,reject) ->
      usersRef = fbRootRef.child("users")
      usersRef.orderByChild("createdAt").limitToLast(1).on("child_added", (snapshot) ->
        Logger.module("Script").log(("closed_beta_hard_wipe() -> Most recently registered user id is: " + snapshot.key()).green)
        return resolve(snapshot.key())
      )
    )
  .then (mostRecentRegistrationKey) ->
    # Go through each user and initialize their wallet and give them 1000 gold, ending when the last user is processed
    usersRef = @fbRootRef.child("users")
    fbRootRef = @fbRootRef

    # create a promise tha resolves when the last users transaction is committed
    return new Promise( (resolve, reject) ->
      usersRef.orderByChild("createdAt").on("child_added", (snapshot) ->
        # operation per user
        userId = snapshot.key()
        Logger.module("Script").log(("closed_beta_hard_wipe() -> Performing wallet wipe for user: " + userId).green)

        return FirebasePromises.set(fbRootRef.child("user-inventory").child(userId).child("wallet"),{
          gold_amount: 1000
          spirit_amount: 0
        })
        .then () ->
          # record action to results
          userResults = results[userId] || {}
          userResults.gaveAlphaGold = true
          results[userId] = userResults

          # resolve if we have reached the last key
          if userId == mostRecentRegistrationKey
            return resolve()
      )
    )
  .then () ->
    logRemovalPromises = []
    logRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-logs')))
    logRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-aggregates')))
    return Promise.all(logRemovalPromises)
  .then () ->
    return results


# Begin script execution
console.log process.argv

if process.argv[2] == 'commit_wipe'
  closed_beta_hard_wipe()
  .then (results) ->
    Logger.module("Script").log(("closed_beta_hard_wipe() -> completed").blue)
    console.log(JSON.stringify(results,null,2))
    process.exit(1);
else
  Logger.module("Script").log(("call 'closed_beta_hard_wipe commit_wipe' to perform wipe").blue)
  process.exit(1)



