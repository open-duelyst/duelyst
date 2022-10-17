
###

  wipe_log_data - Wipes all users inventories and gives them gold based on current gold + 100g per booster pack


  Examples: (no parameters required)
  # Does nothing
  wipe_log_data
  # Actually wipe the data
  wipe_log_data commit_wipe


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
wipe_log_data = () ->

  DuelystFirebase.connect().getRootRef()
  .bind({})
  .then (fbRootRef) ->
    @fbRootRef = fbRootRef
    treeRemovalPromises = []

    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-aggregates')))
    treeRemovalPromises.push(FirebasePromises.remove(@fbRootRef.child('user-logs')))

    return Promise.all(treeRemovalPromises)

# Begin script execution
console.log process.argv

if process.argv[2] == 'commit_wipe'
  wipe_log_data()
  .then () ->
    Logger.module("Script").log(("wipe_log_data() -> completed").blue)
    process.exit(1);
else
  Logger.module("Script").log(("call 'wipe_log_data commit_wipe' to perform wipe").blue)
  process.exit(1)



