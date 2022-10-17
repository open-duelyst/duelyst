Firebase = require 'firebase'
_ = require 'underscore'
fbUtil = require '../../app/common/utils/utils_firebase.js'
config = require '../../config/config.js'

# main firebase reference setup
fbRef = new Firebase(config.get("firebase"))
firebaseToken = config.get("firebaseToken")
fbRef.auth firebaseToken, (error) ->
  if error
    console.log("Error authenticating against our database.")
    process.exit(1)

# auth firebase reference setup
fbAuthRef = new Firebase(config.get("auth"))
authToken = config.get("authToken")
fbAuthRef.auth authToken, (error) ->
  if error
    console.log("Error authenticating against our user database.")
    process.exit(1)

getAllUsernames = (cb) ->
  fbRef.child('users').once 'value', (snapshot) ->
    data = snapshot.val()
    usernames = {}
    for user of data
      username = data[user].username
      usernames[username] = user
    cb(usernames)

addUsername = (id, username) ->
  fbAuthRef.child('user').child(id).child('username').set username, (error) ->
    if error
      console.log("Failed to set username for #{id}:#{username}")
    else
      console.log("Username updated for #{id}:#{username}")

getAllUsernames (result) ->
  _.map result, (id, username) ->
    addUsername(id,username)
