

# region Requires
# Configuration object
config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
Promise = require 'bluebird'
colors = require 'colors'
moment = require 'moment'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../server/lib/users_module")
DuelystFirebase= require("../../server/lib/duelyst_firebase_module")
fbUtil = require '../../app/common/utils/utils_firebase.js'

# auth token and url
firebaseAuthUrl = config.get("auth")
firebaseAuthToken = config.get("authToken")

# reference to the last known user id
last_user_id = null
has_started = false

updatePromises = []

DuelystFirebase.connect(firebaseAuthUrl,firebaseAuthToken).getRootRef()
.bind {}
.then (fbAuthRef) ->

  @.fbAuthRef = fbAuthRef
  return DuelystFirebase.connect().getRootRef()

.then (fbRootRef) ->

  # make sure auth is available to closures
  fbAuthRef = @.fbAuthRef

  return new Promise (resolve,reject)->

    fbRootRef.child('users').limitToLast(1).on 'child_added', (snapshot) ->

      last_user_id = snapshot.key()
      console.log ("LAST USER ID: #{last_user_id.blue}")

      if not has_started
        has_started = true
        fbRootRef.child('users').on 'child_added', (snapshot) ->

          user_id = snapshot.key()
          user_ref = snapshot.ref()

          if snapshot?.val().createdAt

            console.log("user #{user_id.blue} already has createdAt date".yellow)
            resolve(user_id)

          else

            userUpdatePromise = new Promise((resolveUpdate,rejectUpdate)->
              console.log("processing user #{user_id.blue}".cyan)
              fbAuthRef.child('user').child(user_id).once 'value', (auth_user_snapshot) ->
                console.log("found AUTH user #{user_id.blue}")
                if auth_user_snapshot?.val()
                  created_at = auth_user_snapshot.val().createdAt
                  # if no created dat is known, set one
                  if not created_at
                    created_at = moment("2014-11-01").utc().valueOf()
                    auth_user_snapshot.ref().update({createdAt:created_at})
                    console.log("need to estimate user #{user_id.blue}) created at #{created_at} date".yellow)

                  user_ref.update({createdAt:created_at},(error)->
                    if error
                      rejectUpdate(error)
                    else
                      console.log("updated user #{user_id.blue}) with createdAt: #{created_at}")
                      resolveUpdate(user_id)
                  )
                else
                  rejectUpdate(new Error("Could not find user #{user_id.blue} in AUTH database"))
            )

            updatePromises.push(userUpdatePromise)

            # when we hit the last known user, resolve
            if user_id == last_user_id
              resolve(user_id)

.then (user_id)->

  console.log("done looping through users (terminated at #{user_id.blue})... waiting for #{updatePromises.length} updates to finish")
  return Promise.all(updatePromises)

.then ()->

  console.log("ALL DONE!")
  process.exit(1)

.catch (e)->

  console.log("ERROR: #{e.message}".red)
  throw e
  process.exit(1)
