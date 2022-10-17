
###

  sanitize_username_index - Makes all username index entries lowercase

  Examples:
  # Dry run
  coffee sanitize_username_index.coffee
  # commit changes
  coffee sanitize_username_index.coffee commit_changes

###

# region Requires
# Configuration object
config = require("../../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
Promise = require 'bluebird'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../../server/lib/users_module")
DuelystFirebase= require("../../../server/lib/duelyst_firebase_module")
fbUtil = require '../../../app/common/utils/utils_firebase.js'
# endregion Requires

displayProgressInterval = 0
dryRun = true

# Returns a promise that resolves to the names that were converted
sanitize_username_index = () ->
  console.log("Beggining sanitize_username_index()")
  conversions = [] # array of strings representing conversions that occurred

  locFbRootRef = null
  DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    locFbRootRef = fbRootRef

    # find the last user key (so we can iterate through all users)
    return new Promise (resolve, reject) ->
      locFbRootRef.child('username-index').orderByKey().limitToLast(1).once("child_added",(snapshot) ->
        console.log("sanitize_username_index - final user key found: " + snapshot.val())
        resolve(snapshot.val())
      )
  .then (finalUserKey) ->
    localFinalUserKey = finalUserKey
    # go through all users and remove this user from their buddy list
    firebaseWritePromises = []
    usersProcessed = 0
    return new Promise (resolve, reject) ->
      usersOn = locFbRootRef.child('username-index').orderByKey().on("child_added", (snapshot) ->
        # report progress
        usersProcessed++
        if displayProgressInterval && (usersProcessed % displayProgressInterval == 0)
          console.log("sanitize_username_index - Processed #{usersProcessed} users")

        currentUsername = snapshot.key()
        allLowerUsername = currentUsername.toLowerCase()
        currentUserId = snapshot.val()

        if currentUsername != allLowerUsername
          # remove old entry
          firebaseWritePromises.push(new Promise((resolve,reject) ->
            if !dryRun
              locFbRootRef.child('username-index').child(currentUsername).remove( (err) ->
                resolve("Removed #{currentUsername} with id #{currentUserId}")
              )
            else
              resolve("Removed #{currentUsername} with id #{currentUserId}")
          ))

          # set new entry
          firebaseWritePromises.push(new Promise((resolve,reject) ->
            if !dryRun
              locFbRootRef.child('username-index').child(allLowerUsername).set(currentUserId, (err) ->
                resolve("Set #{allLowerUsername} with id #{currentUserId}")
              )
            else
              resolve("Set #{allLowerUsername} with id #{currentUserId}")
          ))

        if currentUserId == localFinalUserKey
          console.log("Got final user" + currentUserId + ". Total of #{usersProcessed} users processed")
          locFbRootRef.child('username-index').off("child_added",usersOn)
          resolve(firebaseWritePromises)
      )
  .then (firebaseWritePromises) ->
    Promise.settle(firebaseWritePromises)


# Handle execution as a script
if process.argv[1].toString().indexOf('sanitize_username_index.coffee') != -1

  # check whether a dry run
  if process.argv[2] == 'commit_changes'
    dryRun = false
  else
    console.log("sanitize_username_index() -> Running dry run.")

  # Begin script execution
  console.log process.argv

  # if executing as a script we will display progress
  displayProgressInterval = 20

  sanitize_username_index()
  .then (results) ->
    console.log("Completed sanitizing user keys")
    if dryRun
      console.log("DRY RUN - NO CHANGES COMMITTED")
    console.log("Conversions made:")
    console.log(_.map(results,(res) ->
      if res.value
        return res.value()
      else
        return "No value"
    ))
    process.exit(1)
  .catch (error) ->
    console.log("Error sanitizing username keys: " + error)
    process.exit(1)

module.exports = sanitize_username_index
