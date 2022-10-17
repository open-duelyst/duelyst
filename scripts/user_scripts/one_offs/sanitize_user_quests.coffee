
###

  sanitize_user_quests - Cleans up quests so users only have 2 quests, and no invalid quests


  Examples: (no parameters required)
  sanitize_user_quests

###

# region Requires
# Configuration object
config = require("../../../config/config.js")
Promise = require 'bluebird'
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
moment = require('moment')
Logger = require '../../../app/common/logger.coffee'
QuestFactory = require '../../../app/sdk/quests/questFactory.coffee'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
UsersModule = require("../../../server/lib/users_module")
DuelystFirebase = require("../../../server/lib/duelyst_firebase_module")
fbUtil = require '../../../app/common/utils/utils_firebase.js'
# endregion Requires


sanitize_user_quests = () ->
  results = {}

  DuelystFirebase.connect().getRootRef()
  .bind({})
  .then (fbRootRef) ->
    # Retrieves the most recently registered user so we know when we've given all users reward
    @fbRootRef = fbRootRef
    return new Promise( (resolve,reject) ->
      usersRef = fbRootRef.child("users")
      usersRef.orderByChild("createdAt").limitToLast(1).on("child_added", (snapshot) ->
        Logger.module("Script").log(("sanitize_user_quests() -> Most recently registered user id is: " + snapshot.key()).green)
        return resolve(snapshot.key())
      )
    )
  .then (mostRecentRegistrationKey) ->
    usersRef = @fbRootRef.child("users")
    return new Promise( (resolve, reject) ->
      usersRef.orderByChild("createdAt").on("child_added", (snapshot) ->
        userId = snapshot.key()

        # operation per user
        # get users quests
        UsersModule.getQuestsRef(userId)
        .then (questsRef) ->
          return new Promise (resolve, reject) ->
            updateQuestData = (questData) ->
              if questData
                if questData.daily and questData.daily.current and questData.daily.current.quests
                  currentQuests = questData.daily.current.quests
                  validQuests = []
                  questIds = []
                  # iterate over quests looking for invalid quests and gathering the valid ones
                  for questIndex,questEntryData of currentQuests
                    quest = QuestFactory.questForIdentifier(questEntryData.q_id)
                    questIds.push(questEntryData.q_id)
                    if quest == undefined
                      Logger.module("Script").log "sanitize_user_quests() -> removing invalid quest id #{questEntryData.q_id} for user #{userId.blue}".red
                    else
                      validQuests.push(questEntryData)

                  # prevent having 3 quests, there is at most 3 so if there is 3 just pop one
                  if validQuests.length == 3
                    Logger.module("Script").log "sanitize_user_quests() -> removing extra quest id #{validQuests[validQuests.length-1].q_id} for user #{userId.blue}".red
                    validQuests.pop()

                  # Refill for any quests removed (up to how many they had before, at most 2)
                  targetNumberOfQuests = Math.min(questIds.length, 2)
                  while validQuests.length < targetNumberOfQuests
                    # add a quest
                    newQuest = QuestFactory.randomQuestForSlotExcludingIds(validQuests.length,questIds)
                    newQuestData = UsersModule.firebaseQuestDataForQuest(newQuest)
                    questIds.push(newQuestData.q_id)
                    Logger.module("Script").log "sanitize_user_quests() -> Added new quest id #{newQuestData.q_id} for user #{userId.blue}".green
                    if newQuestData.q_id == undefined
                      break
                    validQuests.push(newQuestData)

                  # put valid quests into an object
                  newQuests = {}
                  if validQuests.length
                    for i in [0..(validQuests.length-1)]
                      newQuests[i] = validQuests[i]

                  questData.daily.current.quests = newQuests

              return questData

            onUpdateQuestDataComplete = (error,committed,snapshot) ->
              if error
                Logger.module("Script").log "sanitize_user_quests() -> ERROR updating quests for user #{userId.blue}".red
                return reject(error)
              else if committed
                Logger.module("Script").log "sanitize_user_quests() -> COMMITTED for user #{userId.blue}".green
                return resolve()
              else
                Logger.module("Script").log "sanitize_user_quests() -> NOT COMMITTED for user #{userId.blue}".yellow
                return resolve()

            questsRef.transaction(updateQuestData,onUpdateQuestDataComplete)
        .then () ->
          if userId == mostRecentRegistrationKey
            return resolve(results)
      )
    )

# Begin script execution
console.log process.argv

sanitize_user_quests()
.then (results) ->
  Logger.module("Script").log(("sanitize_user_quests() -> completed").blue)
  process.exit(1);

