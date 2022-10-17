Firebase = require 'firebase'
_ = require 'underscore'
Promise = require 'bluebird'
fbUtil = require '../../app/common/utils/utils_firebase.js'
config = require '../../config/config.js'
UsersModule = require '../../server/lib/users_module'

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

buddyLists = {}

fbRef_saveBuddyLists = (cb) ->
  fbRef.child('users').once 'value', (snapshot) ->
    data = snapshot.val()
    for user of data
      id = data[user].id
      buddies = data[user].buddies
      if buddies
        buddyLists[id] = buddies
    cb()

fbRef_wipeRoot = (cb) ->
  fbRef.remove () ->
    cb()

fbRef_wipeUsers = (cb) ->
  fbRef.child('users').remove () ->
    cb()

fbRef_setupProfile = (id, email, username) ->
  return new Promise (resolve, reject) ->
    profile_data = {
      id: id
      email: email
      username: username
      dateJoined: new Date()
      winCount: 0
      lossCount: 0
      presence: {
        username: username
        status: "offline"
      }
    }
    userRef = fbRef.child('users').child(id)
    userRef.setWithPriority profile_data, email, (error) ->
      if error
        return reject(new Error('Firebase error: creating profile failed.'))
      else
        return resolve()

fbRef_setupUser = (id, email, username) ->
  setup = []
  setup.push(fbRef_setupProfile(id,email,username))
  setup.push(UsersModule.cycleUserSeasonRanking(id))
  setup.push(UsersModule.initializeWallet(id))
  return Promise.all(setup)

fbRef_restoreBuddyLists = (id) ->
  return new Promise (resolve, reject) ->
    if (!buddyLists[id])
      return resolve()

    buddies = buddyLists[id]
    fbRef.child('users').child(id).child('buddies').set buddies, (error) ->
      if error
        return reject(new Error('Firebase error: buddy list setup failed.'))
      else
        return resolve()

authRef_getAllUsers = (cb) ->
  fbAuthRef.child('user').on 'child_added', (snapshot) ->
    data = snapshot.val()
    key = snapshot.key()
    # If no username exists, ignore it
    if data.username
      cb(key, data)

fbRef_saveBuddyLists () ->
  fbRef_wipeRoot () ->
    authRef_getAllUsers (key, data) ->
      console.log("User #{data.email} initializing.")
      fbRef_setupUser(key, data.email, data.username)
      .then () ->
        console.log("User #{data.email} initialized.")
        fbRef_restoreBuddyLists(key)
      .catch (e) ->
        console.log("User #{data.email} initialization failed!")
        console.error(e)
