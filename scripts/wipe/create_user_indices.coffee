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

# auth firebase reference setup0
fbAuthRef = new Firebase(config.get("auth"))
authToken = config.get("authToken")
fbAuthRef.auth authToken, (error) ->
  if error
    console.log("Error authenticating against our user database.")
    process.exit(1)

getAllEmails = (cb) ->
  fbAuthRef.child('user').once 'value', (snapshot) ->
    data = snapshot.val()
    emails = {}
    for user of data
      email = data[user].email
      emails[email] = user
    cb(emails)

createEmailIndex = (email, id) ->
  escapedEmail = fbUtil.escapeEmail(email)
  fbRef.child('email-index').child(escapedEmail).set id, (error) ->
    if error
      console("Failed to set index for: " + email)
    else
      console.log("Index created for: " + email)

getAllUsernames = (cb) ->
  fbAuthRef.child('user').once 'value', (snapshot) ->
    data = snapshot.val()
    usernames = {}
    console.log(data)
    for user of data
      username = data[user].username
      usernames[username] = user
    cb(usernames)

createUsernameIndex = (username, id) ->
  fbRef.child('username-index').child(username).set id, (error) ->
    if error
      console("Failed to set index for: " + username)
    else
      console.log("Index created for: " + username)

getAllEmails (result) ->
  _.map result, (id, email) ->
    createEmailIndex(email, id)

getAllUsernames (result) ->
  _.map result, (id, username) ->
    createUsernameIndex(username, id)
