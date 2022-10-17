
# Configuration object
config = require("../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../server/lib/users_module")
DuelystFirebaseModule = require("../server/lib/duelyst_firebase_module")
fbUtil = require '../app/common/utils/utils_firebase.js'

if process.argv[2]

  console.log process.argv

  username = process.argv[2]
  console.log "searching for username: " + username

  UsersModule.userIdForUsername(username)
  .then (userId) ->
    if !userId
      throw new Error("userid not found")
    else
      console.log "found user ... #{userId}"
      process.exit(1)
  .catch (error) ->
    console.log(error)
    process.exit(1)

else
  throw new Error("no username provided")
  process.exit(1)
