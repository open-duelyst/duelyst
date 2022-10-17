
config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
moment = require('moment')
fbRef = new Firebase(config.get("firebase"))
util = require('util')
fs = require('fs')
UsersModule = require('../../server/lib/users_module')
FirebasePromises = require('../../server/lib/firebase_promises')
DuelystFirebaseModule = require("../../server/lib/duelyst_firebase_module")
Promise = require("bluebird")
colors = require("colors")


processUsersStartingWith = (rootRef,startingKey,lastUserKey,limitToCount,callback)->

  console.log("Grabbing batch of #{limitToCount} users (starting with #{startingKey})".green)

  counter = 0
  usersRef = rootRef.child("users").orderByKey().startAt(startingKey).limitToFirst(limitToCount)
  usersRef.on "child_added",(userSnapshot,error)->
    counter++
    console.log("User #{userSnapshot?.key()} @ #{counter}")
    if userSnapshot.key() == lastUserKey
      usersRef.off("child_added")
      callback(true)
    else if counter == limitToCount
      usersRef.off("child_added")
      processUsersStartingWith(rootRef,userSnapshot.key(),lastUserKey,limitToCount,callback)


DuelystFirebaseModule.connect().getRootRef()

.bind {}

.then (fbRootRef) ->

  console.log("CONNECTED... Looking for last user.");

  @.fbRootRef = fbRootRef
  return FirebasePromises.once(@.fbRootRef.child("users").orderByKey().limitToLast(1),"child_added")
  
.then (lastUserSnapshot) ->

  console.log("Found last user: #{lastUserSnapshot.key()}");

  return new Promise (resolve,reject)=>

    processUsersStartingWith @.fbRootRef,undefined,lastUserSnapshot.key(),20,()->
      resolve()

.then ()->

  console.log("ALL DONE!")
  process.exit(1)

.catch (err)->

  console.log("ERROR:",err)
  process.exit(1)
