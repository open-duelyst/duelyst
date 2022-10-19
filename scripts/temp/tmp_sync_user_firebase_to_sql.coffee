# env $(cat .env_for_alpha | xargs) coffee ./scripts/temp/tmp_sync_user_firebase_to_sql.coffee 

require('coffeescript/register')
knex = require("../../server/lib/data_access/knex")
SyncModule = require("../../server/lib/data_access/sync")
DuelystFirebase= require("../../server/lib/duelyst_firebase_module")
FirebasePromises = require("../../server/lib/firebase_promises")
_ = require 'underscore'
Promise = require 'bluebird'
Logger = require('../../app/common/logger')
Errors = require("../../server/lib/custom_errors")
config = require('../../config/config')
moment = require 'moment'

Logger.enabled = false

if not process.env.NODE_ENV?
  throw new Error("NODE_ENV must be defined")

console.time("ALL DONE")

srcFirebase = process.env.SRC_FIREBASE
srcFirebaseSecret = process.env.SRC_FIREBASE_SECRET

if not srcFirebase?
  throw new Error("SRC_FIREBASE must be defined")

if not srcFirebaseSecret?
  throw new Error("SRC_FIREBASE_SECRET must be defined")

firebaseAuthToken = config.get('authToken')
firebaseAuthUrl = config.get('auth')

thisObj = {}

console.log("FROM #{srcFirebase} =====> #{config.get('firebase')}")

return Promise.all([
  DuelystFirebase.connect(firebaseAuthUrl,firebaseAuthToken).getRootRef(),
  DuelystFirebase.connect(srcFirebase,srcFirebaseSecret).getRootRef(),
  DuelystFirebase.connect().getRootRef(),
])
.bind thisObj
.spread (authRef,rootRef,destinationRootRef)->

  @.authRef = authRef
  @.rootRef = rootRef
  @.destinationRootRef = destinationRootRef
#   console.log("loading invite codes... ")
#   console.time("loaded all invite codes")
#   return FirebasePromises.once(@.rootRef.child('invite-codes').child('active'),'value')

# .then (inviteCodesSnapshot)->

#   console.timeEnd("loaded all invite codes")

#   activeCodes = inviteCodesSnapshot.val()

#   return Promise.map(_.keys(activeCodes),(code)->
#     return knex("invite_codes").insert({
#       code:    code,
#       created_at:  moment.utc(activeCodes[code].created_at).toDate()
#     }).then ()->
#   ,{concurrency:10})

# .then ()->

  console.log("loading all users... ")
  console.time("loaded all users")
  return FirebasePromises.once(@.rootRef.child('username-index'),'value')

.then (snapshot)->
  
  return _.values(snapshot.val())

  # return ["-JXSxzSEl1Lez-e_47lz"]

.then (userIds)->

  limit = Math.min(1000000,userIds.length)
  allUserIds = userIds
  # console.timeEnd("loaded all users")
  console.log("#{allUserIds.length} users found")

  authRef = @.authRef
  rootRef = @.rootRef
  destinationRootRef = @.destinationRootRef

  return Promise.map(allUserIds,(userId)->
    if limit > 0
      return SyncModule._syncUserFromFirebaseToSQL(authRef,rootRef,userId)
      .bind thisObj
      .then (userData)->
        if userData.username
          return FirebasePromises.set(@.destinationRootRef.child('users').child(userId).child('presence'),{
            username:userData.username,
            began:moment().utc().valueOf(),
            status:'offline'
            portrait_id:userData.portrait_id || null
          })
      .catch Errors.AlreadyExistsError, (e)-> 
        console.log ("user #{userId} already synced")
      .catch (e)->
        console.log("ERROR on #{userId} ... ",e)
      .finally ()->
        limit--
    else
      return Promise.resolve(true)
  ,{concurrency:20})

.then ()->

  console.timeEnd("ALL DONE")
  process.exit(1)

.catch (error)->

  throw error
