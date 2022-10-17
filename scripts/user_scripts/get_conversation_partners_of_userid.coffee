
###

  get_conversation_partners_of_userid - gets an array of users the given userid has had a conversation with

  Examples:
  coffee get_conversation_partners_of_userid.coffee J_7WmwWlPj0viudZs8G # the hyphen is implied due to bash hyphen passing

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
# endregion Requires

displayProgress = false

# Resolves to an array of user ids the given user has held conversations with
get_conversation_partners_of_userid = (userId) ->
  conversationPartners = []
  conversationsRef = null

  DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    conversationsRef = fbRootRef.child("chat").child("conversations")
    # first get the final key in conversations
    return new Promise (resolve, reject) ->
      conversationsRef.orderByKey().limitToLast(1).once("child_added",(snapshot) ->
        console.log("get_conversation_partners_of_userid - final conversation key found: " + snapshot.key())
        resolve(snapshot.key())
      )
  .then (lastKey) ->
    numConversationsSearched = 0
    return new Promise (resolve, reject) ->
      conversationOn = conversationsRef.orderByKey().on("child_added",(snapshot) ->
        conversationKey = snapshot.key()
        numConversationsSearched++
        if displayProgress && numConversationsSearched % 10 == 0
          console.log(numConversationsSearched + " conversations searched so far")

        conversationParticipants = conversationKey.split(':')
        if conversationParticipants[0] == userId
          conversationPartners.push(conversationParticipants[1])
        if conversationParticipants[1] == userId
          conversationPartners.push(conversationParticipants[0])

        if conversationKey == lastKey
          console.log("Found final key")
          conversationsRef.off("child_added",conversationOn)
          return resolve(conversationPartners)
      )

# Handle execution as a script
if process.argv[1].toString().indexOf('get_conversation_partners_of_userid.coffee') != -1
  # Check usage
  if !process.argv[2] or process.argv.length > 3
    console.log("Unexpected usage.")
    console.log("Given: " + process.argv)
    console.log("Expected: get_conversation_partners_of_userid \'user-id\'")
    throw new Error("no userid provided")
    process.exit(1)

  # Begin script execution
  console.log process.argv

  userId = "-" + process.argv[2]

  # if executing as a script we will display progress
  displayProgress = true

  get_conversation_partners_of_userid(userId)
  .then (partners) ->
    console.log("Conversation partners: " + partners)
    process.exit(1)
  .catch (error) ->
    console.log("Error getting conversation partners for user " + userId + ": " + error)
    process.exit(1)

module.exports = get_conversation_partners_of_userid
