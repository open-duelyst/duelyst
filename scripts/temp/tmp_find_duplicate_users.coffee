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
moment = require 'moment'
fbUtil = require '../../app/common/utils/utils_firebase.js'

Logger.enabled = false

console.time("ALL DONE")

thisObj = {}

return Promise.all([
  DuelystFirebase.connect().getRootRef(),
])
.bind thisObj
.spread (rootRef,destinationRootRef)->

  @.rootRef = rootRef

.then ()->

#   console.log("loading all users... ")
#   console.time("loaded all users")
#   return FirebasePromises.once(@.rootRef.child('username-index'),'value')

# .then (snapshot)->
  
#   return _.values(snapshot.val())

  suspectedDupes = ["-JrsVU-Zmevn0Dkp0xE6","-Juy0FMHW-RXj_98Xdj6","-JqzzOlrKuk16Is64Hks","-JlBwkW0OQxt6jIJVBzw","-JqzyXksWKhf8nJK6c-b","-JyAMvmWt8p6lA1_CwR6","-Juy0FLwEXke-LBPMUya","-JoAatUPCWodYSRCSccZ","-Js06Q9fpF3rdKLyOcmc","-JpcRiw1x_pkQfdXDDBq","-JgxiBFwrp7xwaWlP7me","-Jqzy-y2KAIRt-BHHroX","-Jqzxy_-9nf9okANMmdj","-Juy0FG6HQl8fE7l_K8z","-Juy0FEKay4J95K8Gz9_","-JxHRhGA_5UHSwHBOhJ9","-JjHczzCPPyr5D7x276U","-JlH5TNojLc7M1qlhEDS","-JzNeN2GWuwM-5pYN2EU","-JqzzBhe58VL6ZNd1S7k","-Jy1p1tdMPqi6y2IVm1X","-JlBwkWo5aY8f0Sfkogs","-JlQh3v7KU1wupxwdliT"]
  return suspectedDupes

.then (userIds)->

  allUserIds = userIds
  limit = allUserIds.length # Math.min(10000,userIds.length)
  console.log("#{allUserIds.length} users found")

  rootRef = @.rootRef

  return Promise.map(allUserIds,(userId)->
    if limit > 0
      return FirebasePromises.once(rootRef.child('users').child(userId).child('email'),'value')
      .bind {}
      .then (emailSnapshot)->
        email = @.email = emailSnapshot.val()
        escaped = fbUtil.escapeEmail(email)
        # console.log "found email #{email} #{escaped}"
        return FirebasePromises.once(rootRef.child('email-index').child(escaped),'value')
      .then (idSnapshot)->
        if idSnapshot.val() != userId
          @.realUserId = idSnapshot.val()
          return Promise.all([
            FirebasePromises.once(rootRef.child('users').child(userId).child('presence'),'value')
            FirebasePromises.once(rootRef.child('users').child(@.realUserId).child('presence'),'value')
          ])
          .bind @
          .spread (suspectedUserPresence,realUserPresence)->
            lastSuspectedSeen = if suspectedUserPresence.val()?.began then moment.utc(suspectedUserPresence.val()?.began).format("MM-DD") else null
            lastRealSeen = if realUserPresence.val()?.began then moment.utc(realUserPresence.val()?.began).format("MM-DD") else null
            console.log("user #{userId.blue} is using dupe email #{@.email.cyan} that points to #{@.realUserId.green}")
            console.log("user #{userId.blue} last seen on #{lastSuspectedSeen}. user #{@.realUserId.green} last seen on #{lastRealSeen}")
      .catch (e)->
        console.log("ERROR",e)
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
