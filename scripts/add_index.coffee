Firebase = require 'firebase'
_ = require 'underscore'

fbUtil = require '../app/common/utils/utils_firebase.js'

# Configuration object
config = require '../config/config.js'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = 'AxTA1RfsIzL2hDUOmYyFXQ9VAjnc86EqZ4n8LvxJ'
fbRef = new Firebase('https://duelyst-alpha.firebaseio.com/')

#fbRef = new Firebase(config.get('firebase'))
fbRef.auth firebaseToken, (error) ->
  if error
    # Failed to connect to our secure user database
    console.log("Error authenticating against our database.")
    process.exit(1)

fbAuthRef = new Firebase('https://duelyst-alpha-auth.firebaseio.com/')
authToken = '3UyCSPCLvTBR7zSzUL4Z0hkJB1YcrXK86SNcB3pE'

# Our Firebase with auth data is read-only by admin so we authenticate
# auth is cached by Firebase for future requests
fbAuthRef.auth authToken, (error) ->
  if error
    # Failed to connect to our secure user database
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

createIndex = (email, id) ->
  escapedEmail = fbUtil.escapeEmail(email)
  fbRef.child('email-index').child(escapedEmail).set id, (error) ->
    if error
      console("Failed to set index for: " + email)
    else
      console.log("Index created for: " + email)

getAllEmails (result) ->
  _.map result, (id, email) ->
    createIndex(email, id)
