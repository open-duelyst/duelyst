
###

  highest_rank_for_userid - Checks a user's current, top and history entries for their highest rank

  Examples:
  highest_rank_for_userid -J_7WmwWlPj0viudZs8G

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
colors = require 'colors'
# endregion Requires

# Resolves to the users highest achieved rank (Checks current, top, and history seasons)
highest_rank_for_userid = (userId) ->
  # Retrieve user's top ranking
  return DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @fbRootRef = fbRootRef
    return new Promise (resolve, reject) ->
      # Callback for retrieving ranked data
      onUserRankingData = (snapshot)->
        rankData = snapshot.val()
        if rankData == null
          return reject(new Error("No rank data for #{userId} at reference location #{snapshot.ref().toString()}"))

        highestRank = 30

        # check current
        current = rankData.current
        if current
          currentRank = current.rank
          currentRank = if currentRank != undefined then currentRank else 30
          topRank = current.top_rank
          topRank = if topRank != undefined then topRank else 30
          highestRank = Math.min(highestRank, currentRank, topRank)

        # check top
        top = rankData.top
        if top
          currentRank = top.rank
          currentRank = if currentRank != undefined then currentRank else 30
          topRank = top.top_rank
          topRank = if topRank != undefined then topRank else 30
          highestRank = Math.min(highestRank, currentRank, topRank)

        # check history
        rankHistory = rankData.history
        if rankHistory
          for key,value of rankHistory
            currentRank = value.rank
            currentRank = if currentRank != undefined then currentRank else 30
            topRank = value.top_rank
            topRank = if topRank != undefined then topRank else 30
            highestRank = Math.min(highestRank, currentRank, topRank)

        return resolve(highestRank)

      # Make the call with the callback
      fbRootRef.child("user-ranking").child(userId).once("value",onUserRankingData)

# Handle execution as a script
if process.argv[1].toString().indexOf('highest_rank_for_userid.coffee') != -1
  # Check usage
  if !process.argv[2]
    console.log("Unexpected usage.")
    console.log("Given: " + process.argv)
    console.log("Expected: highest_rank_for_userid \'user-id\'")
    throw new Error("no userid provided")
    process.exit(1)

  # Begin script execution
  console.log process.argv

  userId = process.argv[2].toString()
  highest_rank_for_userid(userId)
  .then (highestRank) ->
    console.log("Highest rank for user id #{userId.blue} is #{highestRank.toString().green}")
    process.exit(1)
  .catch (error) ->
    console.log("Error: #{error.message}")
    process.exit(1)

module.exports = highest_rank_for_userid
