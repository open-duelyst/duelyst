
###

  give_all_users_winter_2015_crate - Gives all current users the Frostfire Festival Giftcrate (no params)

  Examples:
  give_all_users_winter_2015_crate # does a dry run to see what the results will be
  give_all_users_winter_2015_crate commit # gives all users that have yet to get a gift crate one Frostfire Festival gift crate

###

# region Requires
# Configuration object
#config = require("../../config/config.js")
config = require("../../../config/config.js")
Firebase = require("firebase")
_ = require("underscore")
fbRef = new Firebase(config.get("firebase"))
moment = require('moment')
Logger = require '../../../app/common/logger.coffee'
Promise = require 'bluebird'
knex = require '../../../server/lib/data_access/knex'
ProgressBar = require 'progress'

# Firebase secure token for duelyst-dev.firebaseio.com
firebaseToken = config.get("firebaseToken")
DuelystFirebase = require("../../../server/lib/duelyst_firebase_module")
fbUtil = require '../../../app/common/utils/utils_firebase.js'
GiftCrateModule = require '../../../server/lib/data_access/gift_crate.coffee'

GiftCrateLookup = require '../../../app/sdk/giftCrates/giftCrateLookup.coffee'
# endregion Requires

Logger.enabled = false

storeResults = true
results = {
  numUsers: 0
  numUsersProcessed: 0
  numGotGiftCrate: 0
  numAlreadyHadGiftCrate: 0
}
numUsersPerStep = 20

bar = null
dryRun = true

give_all_users_winter_2015_crate = () ->

  Logger.module("Script").log(("give_all_users_winter_2015_crate() -> Beginning script").green)
  Logger.module("Script").log(("give_all_users_winter_2015_crate() -> Retrieving user ids").green)

  bar = new ProgressBar('Giving gift crates [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: 1 # Filled in later
  })

  Logger.module("Script").log(("give_all_users_winter_2015_crate() -> Retreiving num users\n").blue)

  # Uncomment to delete all gift crates first
#  txPromise = knex.transaction (tx)->
#    Promise.all([
#      tx("user_gift_crates").where("crate_type",GiftCrateLookup.WinterHoliday2015).delete()
#      tx("user_gift_crates_opened").where("crate_type",GiftCrateLookup.WinterHoliday2015).delete()
#    ])
#    .then tx.commit
#    .catch tx.rollback
#    return
#  .then ()->
#    knex('users').count('id')
  return knex('users').count('id')
  .then (numUsersData) ->
    numUsers = parseInt(numUsersData[0].count)

    Logger.module("Script").log(("give_all_users_winter_2015_crate() -> Got num users: #{numUsers}\n").blue)
    bar.total = numUsers
    results.numUsers = numUsers
    return _processNextSetOfUsers(0)


_processNextSetOfUsers = (numProcessed) ->
  Logger.module("Script").log(("give_all_users_winter_2015_crate() -> Processing batch #{numProcessed} to #{numProcessed + numUsersPerStep - 1}").blue)
  return knex.column('id').select().from('users').limit(numUsersPerStep).offset(numProcessed)
  .then (users) ->
    Logger.module("Script").log(("give_all_users_winter_2015_crate() -> Finished retrieving batch of user ids").green)
    numUsers = users.length
    results.numUsersProcessed += numUsers

    allTxPromises = []

    # detect completion
    if numUsers == 0
      return Promise.resolve(false)

    return Promise.map(users, (userData) ->
      userId = userData.id
      txPromise = knex.transaction (tx)->
        Promise.all([
          tx("user_gift_crates").select('crate_id').where("user_id",userId).andWhere("crate_type",GiftCrateLookup.WinterHoliday2015).transacting(tx),
          tx("user_gift_crates_opened").select('crate_id').where("user_id",userId).andWhere("crate_type",GiftCrateLookup.WinterHoliday2015).transacting(tx)
        ])
        .spread (userGiftCrates,userOpenedGiftCrates)->
          needsGiftCrate = userGiftCrates.length == 0 && userOpenedGiftCrates.length == 0

          # console.log("User id #{userId} has number of gift crates: #{userGiftCrates.length}")
          # console.log("User id #{userId} has number of gift crates opened: #{userOpenedGiftCrates.length}")
          # console.log("User id #{userId} needs a gift crate: #{needsGiftCrate}")

          if needsGiftCrate
            # console.log "needsGiftCrate..."
            bar.tick()
            if storeResults
              results.numGotGiftCrate++
            if !dryRun
              return GiftCrateModule.addGiftCrateToUser(txPromise,tx,userId,GiftCrateLookup.WinterHoliday2015)
            else
              return Promise.resolve()
          else
            # console.log "does not need crate..."
            bar.tick()
            if storeResults
              results.numAlreadyHadGiftCrate++
            return Promise.resolve()
        .then tx.commit
        .catch tx.rollback

        # return undefined, waits until tx.commit to resolve
        return

      return txPromise
    ,4)

  .then (needsMoreProcessing) ->
    if needsMoreProcessing
      return _processNextSetOfUsers(numProcessed+numUsersPerStep) # TODO: improve
    else
      return Promise.resolve()


# Handle execution as a script
if process.argv[1].toString().indexOf('give_all_users_winter_2015_crate.coffee') != -1

  # Check usage, either must have 2 args (coffee and script name) or third parameter must be commit
  if process.argv.length > 3 || (process.argv[2] != undefined && process.argv[2] != "commit")
    console.log("Unexpected usage.")
    console.log("Given: " + process.argv)
    console.log("Expected: coffee give_allUsers_winter_2015_crate {commit}'")
    throw new Error("Invalid usage")
    process.exit(1)

  # check whether a dry run
  if process.argv[2] == 'commit'
    dryRun = false
  else
    dryRun = true
    console.log("---------------------------------------------------------------------")
    console.log("Performing dry run, no changes will be made to user data")
    console.log("Run give_all_users_winter_2015_crate with 'commit' to perform changes")
    console.log("---------------------------------------------------------------------")

  # Begin script execution
  console.log process.argv

  give_all_users_winter_2015_crate()
  .then () ->
    Logger.module("Script").log(("give_all_users_winter_2015_crate() -> completed\n").blue)
    if dryRun
      console.log("---------------------------------------------------------------------")
      console.log("Completed dry run, no changes were made to user data")
      console.log("---------------------------------------------------------------------")
    console.dir(results)
    process.exit(1);

module.exports = give_all_users_winter_2015_crate
