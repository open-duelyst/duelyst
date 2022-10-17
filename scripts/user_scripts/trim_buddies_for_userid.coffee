
###

  trim_buddies_for_userid - Removes all friends for a user that they have never conversed with

  Examples:
  # dry run
  coffee trim_buddies_for_userid.coffee J_7WmwWlPj0viudZs8G # the hyphen is implied due to bash hyphen passing
  # commit changes
  coffee trim_buddies_for_userid.coffee J_7WmwWlPj0viudZs8G commit_trim

###

# region Requires
# Configuration object
config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
Promise = require 'bluebird'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../server/lib/users_module")
DuelystFirebase= require("../../server/lib/duelyst_firebase_module")
fbUtil = require '../../app/common/utils/utils_firebase.js'
get_conversation_partners_of_userid = require './get_conversation_partners_of_userid.coffee'
# endregion Requires

displayProgressInterval = 20
dryRun = true

# Resolves to an array strings representing buddy relationships created
trim_buddies_for_userid = (userId) ->

  locFbRootRef = null
  locConversationPartners = null
  DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    locFbRootRef = fbRootRef
    # Get all conversation partners from this user
    get_conversation_partners_of_userid(userId)
  .then (conversationPartners) ->
    console.log("trim_buddies_for_userid: received conversation partners")
    locConversationPartners = conversationPartners

    # remove all buddies this user has
    if !dryRun
      locFbRootRef.child('users').child(userId).child('buddies').remove()

    # find the last user key (so we can iterate through all users)
    return new Promise (resolve, reject) ->
      locFbRootRef.child('users').orderByKey().limitToLast(1).once("child_added",(snapshot) ->
        console.log("trim_buddies_for_userid - final user key found: " + snapshot.key())
        resolve(snapshot.key())
      )
  .then (finalUserKey) ->
    # go through all users and remove this user from their buddy list
    return new Promise (resolve, reject) ->
      usersProcessed = 0
      usersOn = locFbRootRef.child('users').orderByKey().on("child_added", (snapshot) ->
        usersProcessed++
        if displayProgressInterval && (usersProcessed % displayProgressInterval == 0)
          console.log("trim_buddies_for_userid - Processed #{usersProcessed} users")

        if !dryRun
          locFbRootRef.child('users').child(snapshot.key()).child('buddies').child(userId).remove( (err) ->
            if snapshot.key() == finalUserKey
              locFbRootRef.child('users').off("child_added",usersOn)
              # finished removing this user from everyones buddy list
              return resolve()
          )
        else
          if snapshot.key() == finalUserKey
            locFbRootRef.child('users').off("child_added",usersOn)
            # finished removing this user from everyones buddy list
            return resolve()
      )
  .then () ->
    # And now we go through and add back all the people this user has ever talked to

    # promises for the buddy setters
    promises = []

    for conversationPartner in locConversationPartners
      if !dryRun
        # Adding user to conversation partner's buddy list
        promises.push(new Promise((resolve,reject) ->
          locFbRootRef.child('users').child(conversationPartner).child('buddies').child(userId).set({id:userId}, (err) ->
            if err
              console.log("trim_buddies_for_userid: Error adding user #{userId} to buddy list of user #{conversationPartner}")
              reject(userId + " -> " + conversationPartner)
            else
              resolve(conversationPartner + " -> " + userId)
          )
        ))

        # Adding conversation partner to user's buddy list
        promises.push(new Promise((resolve,reject) ->
          locFbRootRef.child('users').child(userId).child('buddies').child(conversationPartner).set({id:conversationPartner}, (err) ->
            if err
              console.log("trim_buddies_for_userid: Error adding user #{userId} to buddy list of user #{conversationPartner}")
              reject(userId + " -> " + conversationPartner)
            else
              resolve(userId + " -> " + conversationPartner)
          )
        ))
      else
        promises.push(new Promise (resolve,reject) ->
          resolve(conversationPartner + " -> " + userId)
        )

        promises.push(new Promise (resolve,reject) ->
          resolve(userId + " -> " + conversationPartner)
        )

    return Promise.settle(promises)



# Handle execution as a script
if process.argv[1].toString().indexOf('trim_buddies_for_userid.coffee') != -1
  # Check usage
  if !process.argv[2] or process.argv.length > 3
    console.log("Unexpected usage.")
    console.log("Given: " + process.argv)
    console.log("Expected: trim_buddies_for_userid \'user-id\'")
    throw new Error("no userid provided")
    process.exit(1)

  # Begin script execution
  console.log process.argv

  userId = "-" + process.argv[2]

  # check whether a dry run
  if process.argv[3] == 'commit_trim'
    dryRun = false
  else
    Logger.module("Script").log(("wipe_0_0_16() -> Running dry run.").blue)

  # if executing as a script we will display progress
  displayProgress = true

  trim_buddies_for_userid(userId)
  .then (relationshipsAdded) ->
    console.log("Completed trimming buddies for user: " + userId)
    console.log("Results: ")
    for result in relationshipsAdded
      if result.isFulfilled()
        console.log("Relationship created: " + result.value())
      else if result.isRejected()
        console.log("Error in writing relationship: " + result.reason())
    process.exit(1)
  .catch (error) ->
    console.log("Error resetting fwod for user " + userId + ": " + error)
    process.exit(1)

module.exports = trim_buddies_for_userid
