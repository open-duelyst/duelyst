
###

  clear_user_inventory - takes a user id and wipes their inventory

  Examples:
  clear_user_inventory -J_7WmwWlPj0viudZs8G

###

# region Requires
# Configuration object
config = require("../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../server/lib/users_module")
DuelystFirebase= require("../../server/lib/duelyst_firebase_module")
fbUtil = require '../../app/common/utils/utils_firebase.js'
# endregion Requires

# Performs an inventory clear for a user_id within a promise
clear_user_inventory = (userId) ->
  DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    console.log("clear_user_inventory( " + userId + ")")
    fbRootRef.child("user-inventory").child(userId).child("card-collection").remove()
    fbRootRef.child("user-inventory").child(userId).child("used-booster-packs").remove()
    fbRootRef.child("user-inventory").child(userId).child("booster-packs").remove()
    fbRootRef.child("user-inventory").child(userId).child("wallet").remove()
    fbRootRef.child("user-decks").child(userId).remove()
    UsersModule.initializeWallet(userId)

# Handle execution as a script
if process.argv[1].toString().indexOf('clear_user_inventory.coffee') != -1
  # Check usage
  if !process.argv[2]
    console.log("Unexpected usage.")
    console.log("Given: " + process.argv)
    console.log("Expected: clear_user_inventory \'user-id\'")
    throw new Error("no userid provided")
    process.exit(1)

  # Begin script execution
  console.log process.argv

  clear_user_inventory(argv[2])
  .then () ->
    console.log("Cleared inventory of user: " + argv[2])
  .catch (error) ->
      console.log("Error clearing inventory for user " + argv[2] + ": " + error)

module.exports = clear_user_inventory
