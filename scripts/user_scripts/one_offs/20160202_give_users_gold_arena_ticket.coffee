
###

  give_all_gold_arena_ticket - Gives all current users gold / arena ticket

  Examples:
   give_all_gold_arena_ticket # does a dry run to see what the results will be
   give_all_gold_arena_ticket commit # ...

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
colors = require 'colors'
fs = require 'fs'

# Firebase secure token for duelyst-dev.firebaseio.com
Logger.module("Script").log "loading modules..."
GiftCrateModule = require '../../../server/lib/data_access/gift_crate.coffee'
GiftCrateLookup = require '../../../app/sdk/giftCrates/giftCrateLookup.coffee'
Logger.module("Script").log "loading modules... DONE"
# endregion Requires

Logger.enabled = false
scriptId = 'feb-2016-server-lag-gift-crate3'
resultsLogFile = fs.createWriteStream("#{__dirname}/#{scriptId}.#{moment.utc().valueOf()}.log.txt");
storeResults = true
results = {
  numUsers: 0
  numUsersProcessed: 0
  knownToHaveSucceeded: []
}
batchIndex = 0
batchSize = 20

bar = null
dryRun = true

give_all_gold_arena_ticket = () ->

  if dryRun
    scriptId = scriptId + "-dry"

  Logger.module("Script").log "STARTING"

  bar = new ProgressBar('Giving rewards [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: 1 # Filled in later
  })

  return knex("script_run_records").where('id',scriptId).first()
  .then (scriptRecordRow)->

    if not scriptRecordRow
      Logger.module("Script").log "creating script record row in DB"
      return knex("script_run_records").insert(
        id:scriptId
      )
    else if scriptRecordRow.is_complete
      throw new Error("Looks like this script is marked as COMPLETE")
    else
      batchIndex = scriptRecordRow.last_batch_processed
      results.knownToHaveSucceeded = scriptRecordRow.succeeded_in_batch || []

  .then ()->

    Logger.module("Script").log "Counting records left starting at batch #{batchIndex}"

    return knex('users')
      .count('id')
    .then (results)->
      return results[0].count

  .then (userCount) ->

    startOffset = batchIndex * batchSize
    userCount -= startOffset

    Logger.module("Script").log "Records Left to Process: #{userCount}\n"

    numUsers = userCount
    bar.total = numUsers
    results.numUsers = numUsers


  .then ()->

    return _processNextSetOfUsers(batchIndex)

_processNextSetOfUsers = (batchIndex) ->

  startOffset = batchIndex * batchSize
  Logger.module("Script").log "Processing BATCH #{batchIndex} ... #{startOffset} to #{startOffset + batchSize}".yellow

  return knex('users')
    .select('id')
    .orderBy('id','asc')
    .offset(startOffset)
    .limit(batchSize)
  .bind {}
  .then (users) ->

    Logger.module("Script").log "Processing BATCH #{batchIndex}. count: #{users.length}"
    numUsers = users.length

    @.succeededInBatch = []
    @.errors = []

    # detect completion
    if numUsers == 0
      Logger.module("Script").log "Found ZERO in Batch. Marking self as DONE."
      return Promise.resolve(false)

    return Promise.map(users, (userData) =>
      userId = userData.id

      if _.contains(results.knownToHaveSucceeded,userId)
        Logger.module("Script").debug "SKIPPING already processed user #{userId.green}"
        @.succeededInBatch.push(userId)
        return Promise.resolve()
      else
        return Promise.resolve()
        .bind @
        .then ()->
          if dryRun
            if Math.random() > 0.995
              Logger.module("Script").debug "Errored at #{userId.red}"
              throw new Error("RANDOM ERROR!")
            return knex("users").first().where('id',userId)
          else
            txPromise = knex.transaction (tx)->
              tx("users").first('id').where('id',userId).forUpdate()
              .then (userRow)->
                return GiftCrateModule.addGiftCrateToUser(txPromise,tx,userId,GiftCrateLookup.FebruaryLag2016)
              .then tx.commit
              .catch tx.rollback
              return
            return txPromise
        .then ()->
          resultsLogFile.write("#{userId}\n");
          Logger.module("Script").debug "processed #{userId.blue}"
          results.numUsersProcessed += 1
          @.succeededInBatch.push(userId)
          if not dryRun
            bar.tick()
        .catch (e)->
          @.errors.push(e)
          console.error "ERROR on user #{userId}: #{e.message}.".red

    ,{concurrency:8})

  .catch (e)->

    @.errors.push(e)

  .then (needsMoreProcessing) ->

    if @.succeededInBatch.length != batchSize or @.errors.length > 0
      if @.errors.length > 0
        console.error "ERROR: #{@.errors[0].message}. Processed #{results.numUsersProcessed}/#{results.numUsers}. Stopped at Batch: #{batchIndex} (starting at #{batchIndex * batchSize})"

    @.needsMoreProcessing = needsMoreProcessing

    Logger.module("Script").debug "Updating Script Run Record"

    complete = !@.needsMoreProcessing
    listSucceeded = null
    if @.errors.length > 0
      complete = false
      listSucceeded = @.succeededInBatch

    return knex("script_run_records").where('id',scriptId).update(
      last_batch_processed: batchIndex
      updated_at: moment().utc().toDate()
      succeeded_in_batch: listSucceeded
      is_complete: complete
    )

  .then ()->

    if @.errors.length > 0
      console.error "ERROR count #{@.errors.length}"
      console.error @.errors
      resultsLogFile.end()
      throw new Error("ABORTING")

    if @.needsMoreProcessing
      batchIndex += 1
      return _processNextSetOfUsers(batchIndex)
    else
      resultsLogFile.end()
      return Promise.resolve()

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
  Logger.enabled = false
else
  dryRun = true
  Logger.enabled = true
  console.log("---------------------------------------------------------------------")
  console.log("Performing dry run, no changes will be made to user data")
  console.log("Run give_all_gold_arena_ticket with 'commit' to perform changes")
  console.log("---------------------------------------------------------------------")

# Begin script execution
# console.log process.argv

give_all_gold_arena_ticket()
.then () ->
  Logger.module("Script").log(("give_all_gold_arena_ticket() -> completed\n").blue)
  if dryRun
    console.log("---------------------------------------------------------------------")
    console.log("Completed dry run, no changes were made to user data")
    console.log("---------------------------------------------------------------------")
  console.dir(results)
  process.exit(1);

module.exports = give_all_gold_arena_ticket
