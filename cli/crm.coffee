# libraries
path = require('path')
require('app-module-path').addPath(path.join(__dirname, '..'))
program = require('vorpal')()
Promise = require 'bluebird'
moment = require 'moment'
ProgressBar = require 'progress'
config = null
inquirerPromisifed = require 'bluebird-inquirer'
inquirer = require 'inquirer'
colors = require 'colors'
uuid = require 'node-uuid'
PrettyError = require 'pretty-error'
prettyjson = require 'prettyjson'
Logger = require 'app/common/logger'
Errors = require 'server/lib/custom_errors'
validator = require 'validator'
_ = require 'underscore'
encryptor = require './lib/crypt'
PaypalTools = require './lib/paypal-tools'
fs = require 'fs'
url = require 'url'
hbs = require 'hbs'
handlebars = hbs.handlebars
Promise.promisifyAll(fs)
Promise.promisifyAll(encryptor)
helpers = require 'scripts/helpers'

# Wartech general achievements
WartechGeneralFaction1Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction1Achievement'
WartechGeneralFaction2Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction2Achievement'
WartechGeneralFaction3Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction3Achievement'
WartechGeneralFaction4Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction4Achievement'
WartechGeneralFaction5Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction5Achievement'
WartechGeneralFaction6Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction6Achievement'

generatePushId = require 'app/common/generate_push_id'

# firebase
DuelystFirebase = require 'server/lib/duelyst_firebase_module'
FirebasePromises = require 'server/lib/firebase_promises'
fbUtil = require 'app/common/utils/utils_firebase'
hashHelpers = require 'server/lib/hash_helpers'

# data access modules
DataAccessHelpers = require('server/lib/data_access/helpers')
InventoryModule = null
UsersModule = null
ChallengesModule = null
SyncModule = null
GiftCrateModule = null
GauntletModule = null
PaypalModule = null
CosmeticChestsModule = null
ShopModule = null
QuestsModule = null
AchievementsModule = null

# sdk
SDK = require 'app/sdk'

# setup globals
knex = null
mailer = null

# configure pretty error
prettyError = new PrettyError()
prettyError.skipNodeFiles()
prettyError.skipPackage('bluebird')

# configure bluebird long stack support
process.env.BLUEBIRD_DEBUG = 1

# configure logger
Logger.enabled = true

###*
# Custom error used by the confirmation prompt promise
# @class
###
class DidNotConfirmError extends Error
  constructor: (@message = "You did not confirm.") ->
    @name = "DidNotConfirmError"
    @status = 404
    @description = "You did not confirm."
    Error.captureStackTrace(this, DidNotConfirmError)
    super(@message)

###*
# Show a general purpose confirmation prompt
# @public
# @param  {String}  msg      Custom confirmation message.
# @return  {Promise}        Promise that will resolve if the user confirms with a 'Y' or reject with DidNotConfirmError otherwise.
###
confirmAsync = (msg="...")->
  return new Promise (resolve,reject)->
    unless program.noprompt?
      inquirer.prompt [{
        name:'confirm'
        message:"<#{config.get('env')}> #{msg} continue? Y/N?"
      }],(answers)->
        if answers.confirm.toLowerCase() == "y"
          resolve()
        else
          reject(new DidNotConfirmError())
    else
      resolve()

promptWithList = (message,inputChoices)->
  return inquirerPromisifed.prompt([{
    name:'choice'
    message:message
    type:"list"
    choices:inputChoices
  }]).then (promptResult)->
    return promptResult.choice


###*
# console.log data as a table
# @public
# @param  {String}  data      data to print out.
###
logAsTable = (dataRows)->
  keys = _.keys(dataRows[0])
  Table = require('cli-table')
  t = new Table({
    head: keys
  })
  _.each dataRows, (r)->
    values = _.values(r)
    values = _.map values, (v)->
      if v instanceof Date
        v = moment(v).format("YYYY-MM-DD HH:mm:ss")
      return v || ""
    t.unshift values

  strTable = t.toString()
  console.log(strTable)
  return strTable

program
  .version('0.0.1')
  # .option('-d, --debug', 'Enable verbose debug logging')
  # .option('-n, --noprompt', 'Enable/disable confirmation prompts')

program
  .command 'config:info'
  .description 'print out current config info'
  .action (args,callback)->
    configData = JSON.parse(config.toString())
    console.log prettyjson.render(_.pick(configData,["env","firebase"]))
    callback()

###
program
  .command 'invites:generate <count>'
  .description 'generate invite codes'
  .action (args,callback)->
    count = args.count
    confirmAsync("about to generate #{count} invite codes")
    .bind {}
    .then ()->

      console.log("generating #{count} invite codes")

      bar = new ProgressBar('generating [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: parseInt(count)
      })

      @.allCodes = allCodes = []

      for [0 ... count]
        allCodes.push uuid.v4()

      return knex.transaction (tx)->
        allPromises = []
        for code in allCodes
          allPromises.push tx("invite_codes").insert({code:code}).then ()-> bar.tick()
        return Promise.all(allPromises)

    .then ()->

      for code in @.allCodes
        console.log code

      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'invites:info <code>'
  .description 'generate invite codes'
  .action (args,callback)->
    code = args.code
    return Promise.all([
      knex("invite_codes").where({code:code}).first()
      knex("users").where({invite_code:code}).first()
    ])
    .bind {}
    .spread (codeRow,userRow)->

      if codeRow?
        console.log "FOUND CODE".green
        console.log prettyjson.render(codeRow)
      else if userRow?
        console.log "FOUND USER".green
        console.log prettyjson.render(userRow)
      else
        console.log "CODE NOT FOUND".red

      callback()
      # process.exit(0)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'mailchimp:segments <list_name>'
  .description 'list segments for a mailchimp mailing list'
  .action (args,callback)->

    list_name = args.list_name

    MailChimpAPI = require('mailchimp').MailChimpAPI
    apiKey = config.get('mailchimpApiKey')

    if not apiKey
      throw new Error("Looks like you don't have the MAILCHIMP_API_KEY env variable set")

    Promise.resolve()
    .bind {}
    .then ()->

      @.api = new MailChimpAPI(apiKey, { version : '2.0' })
      return @.api

    .then (api)->

      api = @.api
      return new Promise (resolve,reject) ->

        api.call('lists', 'list', { filters: {list_name:list_name} }, (error, data) ->
          if (error)
            reject(error)
            console.log(error.message)
          else
            if data["data"].length > 0
              list_data = data["data"][0]
              if program.debug
                console.log("Found list with name: #{list_data["name"]} and id: #{list_data["id"]}")
              resolve(list_data["id"])
            else
              reject(new Error("no list found with the specified name '#{list_name}'"))
        )

    .then (list_id)->

      @.list_id = list_id

      api = @.api
      return new Promise (resolve,reject) ->
        api.call('lists', 'static-segments', { id:list_id }, (error, data) ->
          if (error)
            reject(error)
            console.log(error.message)
          else
            resolve(data)
        )

    .then (segment_data)->

      console.log prettyjson.render(segment_data)
      callback()
      # process.exit(0)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'mailchimp:add_gift_codes_to_segment <list_name> <segment_name> <field_name> <code_type>'
  .description 'add invite codes to specified segment'
  .action (args,callback)->

    list_name = args.list_name
    segment_name = args.segment_name
    field_name = args.field_name
    code_type = args.code_type

    if not list_name?
      throw new Error("Invalid list_name")

    if not segment_name?
      throw new Error("Invalid segment_name")

    if not validator.isAlphanumeric(field_name)
      throw new Error("Invalid field_name")

    if not code_type?
      throw new Error("Invalid code_type")

    MailChimpAPI = require('mailchimp').MailChimpAPI
    apiKey = config.get('mailchimpApiKey')

    if not apiKey
      throw new Error("Looks like you don't have the MAILCHIMP_API_KEY env variable set")

    confirmAsync("about to add gift code type #{code_type.yellow} to segment #{segment_name.cyan} into field #{field_name.yellow}")
    .bind {}
    .then ()-> # construct mailchimp api
      @.api = new MailChimpAPI(apiKey, { version : '2.0' })
      return @.api
    .then (api)-> # find the mailchimp list id
      api = @.api
      return new Promise (resolve,reject) ->
        api.call('lists', 'list', { filters: {list_name:list_name} }, (error, data) ->
          if (error)
            reject(error)
            console.log(error.message)
          else
            if data["data"].length > 0
              list_data = data["data"][0]
              if program.debug
                console.log("Found list with name: #{list_data["name"]} and id: #{list_data["id"]}")
              resolve(list_data["id"])
            else
              reject(new Error("no list found with the specified name '#{list_name}'"))
        )
    .then (list_id)-> # find the segment data
      @.list_id = list_id
      api = @.api
      return new Promise (resolve,reject) ->
        api.call('lists', 'static-segments', { id:list_id }, (error, data) ->
          if (error)
            reject(error)
            console.log(error.message)
          else
            resolve(data)
        )
    .then (segment_data)-> # load segment member data
      if program.debug
        console.log prettyjson.render(segment_data)
      segment_id = null
      # var to initialize the progress bar
      bar = null
      for segment in segment_data
        if segment.name == segment_name
          if program.debug
            console.log("found a static segment: #{segment.name} with ID: #{segment.id}")
          # lazy initialize progress bar
          bar ?= new ProgressBar('loading segment [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: parseInt(segment["member_count"])
          })
          segment_id = segment.id

      if not segment_id
        throw new Error("Could not find required segment")

      list_id = @.list_id
      api = @.api
      return new Promise (resolve,reject) ->

        members = []
        add_members = (startPage)->
          api.call('lists', 'members', { id:list_id, opts:{ start:startPage, limit:100, segment:{saved_segment_id:segment_id} } }, (error, data) ->
            if (error)
              reject(error)
              console.log(error.message)
            else

              for member in data["data"]
                members.push(member)

              bar.tick(data["data"].length)
              # console.log("got #{members.length} of #{data["total"]}")

              if members.length % 100 != 0
                resolve(members)
              else
                next_page = members.length / 100
                add_members(next_page)
          )
        # start loading member data
        add_members(0)

    .then (members_data)-> # filter to find members with no no codes

      @.members_data = members_data
      @.members_with_no_codes = _.filter members_data,(member) =>

        hasCode = false
        if member["merges"][field_name]?.length > 0
          if validator.isUUID(member["merges"][field_name])
            # console.log "CODE found #{member["merges"][field_name]}"
            hasCode = true
          else
            # console.log "CODE #{member["merges"][field_name]} considered falsy".yellow

        return !hasCode


      console.log("Found #{members_data.length} members in the specified list and #{@.members_with_no_codes.length} with no codes")

      return confirmAsync('generate codes?')

    .then ()-> # generate and store invite codes

      console.log("generating #{@.members_with_no_codes.length} codes for #{config.get('env').toUpperCase().red}")

      bar = new ProgressBar('generating codes [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: @.members_with_no_codes.length
      })

      @.allCodes = allCodes = []

      for [0 ... @.members_with_no_codes.length]
        allCodes.push uuid.v4()

      return knex.transaction (tx)->
        allPromises = []
        for code in allCodes
          allPromises.push tx("gift_codes").insert({
            code: code
            type: code_type
          }).then ()-> bar.tick()
        Promise.all(allPromises)
        .then ()-> return confirmAsync("commit and merge #{allCodes.length} codes?")
        .then ()-> tx.commit()
        .catch (e)-> tx.rollback()

    .then ()-> # merge codes into mailchimp member data

      console.log("merging #{@.allCodes.length} codes into members list")

      list_id = @.list_id
      api = @.api

      bar = new ProgressBar('merging codes [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: @.members_with_no_codes.length
      })

      processMember = (member,i) =>

        if @.allCodes.length == 0
          console.log("ERROR: looks like we ran out of codes")
          throw new Error("Ran out of codes")

        code = @.allCodes.shift()
        member["merges"][field_name] = code

        console.log("giving #{member["email"]} code #{field_name}=#{code}")

        return new Promise (resolve,reject) ->
          api.call('lists', 'update-member', { id:list_id, email: {email:member["email"]}, merge_vars: member["merges"] }, (error, data) ->
            if (error)
              reject(error)
              console.log(error.message)
            else
              bar.tick()
              resolve(true)
          )

      return Promise.map @.members_with_no_codes, processMember, { concurrency:5 }

    .then () ->

      console.log("SUCCESS".green + ": #{@.members_with_no_codes.length} codes merged into mailchimp list")
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->
      if e
        console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'mailchimp:add_gift_codes_to_list <list_name> <code_class>'
  .description 'add invite codes to specified list'
  .action (args,callback)->

    list_name = args.list_name
    code_class = args.code_class
    field_name = "GIFTCODE"
    rewards = {}

    if not list_name?
      return Promise.reject(new Error("Invalid list_name"))

    if not code_class?
      return Promise.reject(new Error("Invalid code_class"))

    MailChimpAPI = require('mailchimp').MailChimpAPI
    apiKey = config.get('mailchimpApiKey')

    switch code_class
      when "pax-west-2016" then rewards.cosmetics = [1000013] # SarlacPrime
      when "ks-skins" then rewards.cosmetics = [1000015,1000016] # Faction2GeneralDogehai, Faction1GeneralRogueLegacy
      else return Promise.reject(new Error("Unknown pre-set code classification: #{code_class} ... this needs to be hardcoded into the CRM"))

    console.log "rewards:", prettyjson.render(rewards)

    if not apiKey
      return Promise.reject(new Error("Looks like you don't have the MAILCHIMP_API_KEY env variable set"))

    confirmAsync("about to add gift code type #{code_class.yellow} to list into field #{field_name.yellow}")
    .bind {}
    .then ()-> # construct mailchimp api
      @.api = new MailChimpAPI(apiKey, { version : '2.0' })
      return @.api
    .then (api)-> # find the mailchimp list id
      api = @.api
      console.log("looking for list...")
      return new Promise (resolve,reject) ->
        api.call('lists', 'list', { filters: {list_name:list_name} }, (error, data) ->
          if (error)
            console.log(error.message)
            reject(error)
          else
            console.log(prettyjson.render(data))
            if data["data"].length > 0
              list_data = data["data"][0]
              if program.debug
                console.log("Found list with name: #{list_data["name"]} and id: #{list_data["id"]}")
              resolve(list_data)
            else
              reject(new Error("no list found with the specified name '#{list_name}'"))
        )
    .then (listData)-> # load members
      @.list_id = list_id = listData.id
      api = @.api
      console.log("found list #{list_id}")

      # lazy initialize progress bar
      bar = new ProgressBar('loading list [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: parseInt(listData.stats.member_count)
      })

      # load members 100 by 100
      return new Promise (resolve,reject) ->

        members = []
        add_members = (startPage)->
          api.call('lists', 'members', { id:list_id, opts:{ start:startPage, limit:100 } }, (error, data) ->
            if (error)
              reject(error)
              console.log(error.message)
            else

              for member in data["data"]
                members.push(member)

              bar.tick(data["data"].length)
              # console.log("got #{members.length} of #{data["total"]}")

              if members.length % 100 != 0
                resolve(members)
              else
                next_page = members.length / 100
                add_members(next_page)
          )
        # start loading member data
        add_members(0)
    .then (members_data)-> # filter to find members with no no codes
      @.members_data = members_data
      @.members_with_no_codes = _.filter members_data,(member) =>
        hasCode = false
        if member["merges"][field_name]?.length > 0
          if validator.isUUID(member["merges"][field_name])
            # console.log "CODE found #{member["merges"][field_name]}"
            hasCode = true
          else
            # console.log "CODE #{member["merges"][field_name]} considered falsy".yellow
        return !hasCode
      console.log("Found #{members_data.length} members in the specified list and #{@.members_with_no_codes.length} with no codes")
      return confirmAsync("generate #{@.members_with_no_codes.length} codes?")
    .then ()-> # generate and store invite codes

      console.log("generating #{@.members_with_no_codes.length} codes for #{config.get('env').toUpperCase().red}")

      bar = new ProgressBar('generating codes [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: @.members_with_no_codes.length
      })

      @.allCodes = allCodes = []

      for [0 ... @.members_with_no_codes.length]
        allCodes.push uuid.v4()

      return knex.transaction (tx)->
        allPromises = []
        for code in allCodes
          allPromises.push tx("gift_codes").insert({
            code: code
            type: "rewards"
            rewards: rewards
            exclusion_id: code_class
          }).then ()-> bar.tick()
        Promise.all(allPromises)
        .then ()-> return confirmAsync("commit and merge #{allCodes.length} codes?")
        .then ()-> tx.commit()
        .catch (e)->
          console.log(e)
          tx.rollback()
    .then ()-> # merge codes into mailchimp member data

      console.log("merging #{@.allCodes.length} codes into members list")

      list_id = @.list_id
      api = @.api

      bar = new ProgressBar('merging codes [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: @.members_with_no_codes.length
      })

      processMember = (member,i) =>

        if @.allCodes.length == 0
          console.log("ERROR: looks like we ran out of codes")
          throw new Error("Ran out of codes")

        code = @.allCodes.shift()
        member["merges"][field_name] = code

        console.log("giving #{member["email"]} code #{field_name}=#{code}")

        return new Promise (resolve,reject) ->
          api.call('lists', 'update-member', { id:list_id, email: {email:member["email"]}, merge_vars: member["merges"] }, (error, data) ->
            if (error)
              reject(error)
              console.log(error.message)
            else
              bar.tick()
              resolve(true)
          )

      return Promise.map @.members_with_no_codes, processMember, { concurrency:5 }
    .then () ->
      console.log("SUCCESS".green + ": #{@.members_with_no_codes.length} codes merged into mailchimp list")
      callback()
    .catch DidNotConfirmError, (e)->
      console.log(e.message)
    .catch (e)->
      console.log(e.message)
      # console.log prettyError.render(e)
      callback(e)

program
  .command 'mailchimp:merge <type>'
  .description 'merge live user data into mailchimp. type "analyze" or "merge"'
  .action (args,callback)->

    type = args.type

    MailChimpAPI = require('mailchimp').MailChimpAPI
    apiKey = config.get('mailchimpApiKey')

    #
    whereClause = ()->
      this.where('created_at', '>', '2017-03-01') # 'username':'raithe'
    listName = "DUELYST BETA Requests"

    if not apiKey
      throw new Error("Looks like you don't have the MAILCHIMP_API_KEY env variable set")

    Promise.resolve()
    .bind {}
    .then ()->

      @.api = new MailChimpAPI(apiKey, { version : '2.0' })
      Promise.promisifyAll(@.api)
      return @.api

    .then (api)->

      api = @.api
      return new Promise (resolve,reject) ->

        api.call('lists', 'list', { filters: { list_name: listName } }, (error, data) ->
          if (error)
            reject(error)
            console.log(error.message)
          else
            if data["data"].length > 0
              list_data = data["data"][0]
              if program.debug
                console.log("Found list with name: #{list_data["name"]} and id: #{list_data["id"]}")
              resolve(list_data["id"])
            else
              reject(new Error("no list found with the specified name '#{list_name}'"))
        )

    .then (list_id)->

      @.list_id = list_id

      return confirmAsync("about to merge ALL user data to list #{list_id}")

    .then ()->

      return knex("users").where(whereClause).count('id')

    .then (result)->

      return parseInt(result[0].count)

    .then (totalUserCount)->

      @.found_count = 0
      @.not_found_count = 0

      bar = new ProgressBar("merging #{totalUserCount} users [:bar] :percent :etas", {
        complete: '=',
        incomplete: ' ',
        width: 50,
        total: Math.ceil(totalUserCount/20)
      })

      allOffsets = []
      for i in [0...Math.ceil(totalUserCount/20)]
        allOffsets.push(i*20)

      return Promise.map(allOffsets,(offset)=>

        return knex("users").where(whereClause).select("id","email","username","ltv","created_at","last_session_at","session_count","top_rank","total_gold_earned").limit(20).offset(offset)
        .bind @
        .then (userRows)->

          batch = []
          for row in userRows
            batch.push {
              email: {email:row["email"]},
              merge_vars:
                USERID:row["id"]
                USERNAME:row["username"]
                LTV:row["ltv"]
                REGDATE:row["created_at"]
                LOGINDATE:row["last_session_at"]
                SESSCOUNT:row["session_count"]
                TOPRANK:row["top_rank"]
                TOTALGOLD:row["total_gold_earned"]
            }

          if type == "analyze"
            return @.api.callAsync('lists', 'member-info', {
              id:@.list_id,
              emails: _.map userRows, (r)-> return { email:r.email }
            })
          else if type == "merge"
            return new Promise (resolve,reject) =>
              @.api.call('lists', 'batch-subscribe', {
                id:@.list_id,
                batch: batch,
                double_optin:false,
                update_existing:true
              }, (error, data) ->
                if (error)
                  reject(error)
                  console.log(error.message)
                else
                  resolve(true)
              )
          else
            throw new Errors.BadRequestError("operation not implemented")

        .then (data) ->
          @.found_count += data?.success_count
          @.not_found_count += data?.error_count
        .catch Errors.BadRequestError, (e)->
          throw e
        .catch (e)->
          console.log("ERROR on batch #{offset} ... ",e)
        .finally ()->
          bar?.tick()

      ,{concurrency:10})

    .then ()->

      console.log("ALL DONE. #{@.found_count} found, #{@.not_found_count} not found".green)
      callback()
      # process.exit(1)

    .catch DidNotConfirmError, (e)->

      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)
###
program
  .command 'users:info <username_or_email>'
  .description 'get info on a user based on username or email'
  .action (args,callback)->

    username_or_email = args.username_or_email
    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")

    if fieldName == 'email' or fieldName == 'username'
      username_or_email = username_or_email.toLowerCase()

    knex("users").where(fieldName,username_or_email).then (rows)->

      if rows.length == 0
        throw new Error("Could not find user")

      _.each(rows,(r)-> delete r.password)

      console.log prettyjson.render(rows)
      callback()
      # process.exit(0)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'users:currency_log <username_or_email>'
  .description 'get currency log for a user based on username or email'
  .action (args,callback)->
    username_or_email = args.username_or_email
    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")

    if fieldName == 'email' or fieldName == 'username'
      username_or_email = username_or_email.toLowerCase()

    knex("users").where(fieldName,username_or_email).first('id','username','email').then (userRow)->

      if not userRow?
        throw new Error("Could not find user")

      console.log prettyjson.render({
        id:userRow.id
        username:userRow.username
        email:userRow.email
      })

      return knex("user_currency_log").where('user_id',userRow.id).orderByRaw('created_at desc')

    .then (rows)->

      _.each rows, (c)->
        delete c.id
        delete c.user_id

      logAsTable(rows)
      callback()
      # process.exit(0)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'sales:add_sale <sku> <sale_percent_discount> <sale_start> <sale_end>'
  .description 'creates product sale'
  .action (args,callback)->
    sku = args.sku
    salePercentDiscount = args.sale_percent_discount
    saleStart = args.sale_start
    saleEnd = args.sale_end

    ShopModule ?= require 'server/lib/data_access/shop'

    if sku == null or ShopModule.productDataForSKU(sku) == null
      throw new Error("Invalid sku: " + sku)

    if salePercentDiscount == null or salePercentDiscount < 0 or salePercentDiscount > 1.00
      throw new Error("Invalid discount: " + salePercentDiscount + " (Expecting a number between 0 and 1)")

    if saleStart == null
      throw new Error("Invalid sale start: " + saleStart)

    if saleEnd == null
      throw new Error("Invalid sale end: " + saleEnd)

    saleStartMoment = moment.utc(saleStart)
    saleEndMoment = moment.utc(saleEnd)
    productData = ShopModule.productDataForSKU(sku)

    # Do Rounding here
    newProductPrice = Math.floor(productData.price * (1 - salePercentDiscount))

    confirmAsync("Are you sure you want to create the following sale for '#{productData.name}':\n" +
          "Original Price: #{productData.price}\n" +
          "Discount Percent: #{salePercentDiscount}\n" +
          "New Price: #{newProductPrice}\n" +
          "Sale Start: #{saleStartMoment.toString()}\n" +
          "Sale End: #{saleEndMoment.toString()}\n" +
          "...?")
    .then () ->
      saleData = {
        sale_id: generatePushId()
        sku: sku
        sale_price: newProductPrice
        sale_starts_at: saleStartMoment.toDate()
        sale_ends_at: saleEndMoment.toDate()
        created_at: moment.utc().toDate()

      }
      return knex("shop_sales").insert(saleData)
    .then ()->
      return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      return FirebasePromises.set(fbRootRef.child('shop-sales').child("sales_updated_at"),moment.utc().valueOf())
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)


program
  .command 'sales:delete_sale <sale_id>'
  .description 'Deletes a sale - should only be used for development purposes, disable sales for production'
  .action (args,callback)->
    saleId = args.sale_id

    return knex("shop_sales").first().where("sale_id",saleId)
    .then (saleRowToBeDeleted) ->
      if (saleRowToBeDeleted == null)
        throw new Error("No matching sale with id: " + saleId)

      return confirmAsync("!Sales on production should be DISABLED not deleted!"
          "Are you sure you want to delete the following sale:\n" + prettyjson.render(saleRowToBeDeleted)
          "...?")
    .then () ->
      return knex("shop_sales").where("sale_id",saleId).delete()
    .then ()->
      return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef) ->
      return FirebasePromises.set(fbRootRef.child('shop-sales').child("sales_updated_at"),moment.utc().valueOf())
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)

program
  .command 'sales:list_all'
  .description 'Reports a list of all shop sales'
  .action (args,callback)->

    MOMENT_NOW_UTC = moment.utc()


    return knex("shop_sales").select()
    .then (shopSaleRows)->
      console.log prettyjson.render(shopSaleRows)
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)

program
  .command 'sales:list_by_page <page_num>'
  .description 'Reports a list of shop sales '
  .action (args,callback)->
    ShopModule ?= require 'server/lib/data_access/shop'

    MOMENT_NOW_UTC = moment.utc()
    pageNum = args.page_num
    numPerPage = 5

    return knex("shop_sales").select().orderBy("sale_starts_at","desc")
    .then (shopSaleRows)->
      for saleRow in shopSaleRows
        saleRow.discount_percent = 1 - (saleRow.sale_price / ShopModule.productDataForSKU(saleRow.sku).price)
      console.log prettyjson.render(shopSaleRows)
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)

program
  .command 'users:spirit_orbs <username_or_email>'
  .description 'get currency log for a user based on username or email'
  .action (args,callback)->
    username_or_email = args.username_or_email
    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")

    if fieldName == 'email' or fieldName == 'username'
      username_or_email = username_or_email.toLowerCase()

    knex("users").where(fieldName,username_or_email).first('id','username','email').then (userRow)->

      if not userRow?
        throw new Error("Could not find user")

      console.log prettyjson.render({
        id:userRow.id
        username:userRow.username
        email:userRow.email
      })

      return knex("user_spirit_orbs").where('user_id',userRow.id).orderByRaw('created_at desc')

    .then (rows)->

      _.each rows, (c)->
        delete c.id
        delete c.user_id

      logAsTable(rows)
      callback()
      # process.exit(0)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'users:cards <username_or_email> [card_id]'
  .description 'get cards data for a user based on username or email'
  .action (args,callback)->
    username_or_email = args.username_or_email
    card_id = args.card_id

    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")

    if fieldName == 'email' or fieldName == 'username'
      username_or_email = username_or_email.toLowerCase()

    knex("users").where(fieldName,username_or_email).first('id','username','email').then (userRow)->

      if not userRow?
        throw new Error("Could not find user")

      console.log prettyjson.render({
        id:userRow.id
        username:userRow.username
        email:userRow.email
      })

      whereClause = { 'user_id': userRow.id }
      if card_id?
        whereClause.card_id = card_id
      return knex("user_cards").where(whereClause).orderByRaw('updated_at desc')

    .then (cardRows)->

      _.each cardRows, (c)-> delete c.user_id

      logAsTable(cardRows)
      callback()
      # process.exit(0)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'users:card_log <username_or_email> [card_id]'
  .description 'get card log for a user based on username or email'
  .action (args,callback)->
    username_or_email = args.username_or_email
    card_id = args.card_id
    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")

    if fieldName == 'email' or fieldName == 'username'
      username_or_email = username_or_email.toLowerCase()

    knex("users").where(fieldName,username_or_email).first('id','username','email').then (userRow)->

      if not userRow?
        throw new Error("Could not find user")

      console.log prettyjson.render({
        id:userRow.id
        username:userRow.username
        email:userRow.email
      })

      whereClause = { 'user_id': userRow.id }
      if card_id?
        whereClause.card_id = card_id
      return knex("user_card_log").where(whereClause).orderByRaw('created_at desc')

    .then (logRows)->

      _.each logRows, (c)->
        delete c.user_id
        delete c.id

      logAsTable(logRows)
      callback()
      # process.exit(0)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)


program
.command 'users:convert_spirit_orbs <username_or_email> <from_card_set_id> <to_card_set_id> <num_orbs_to_convert>'
.description 'removes a provided number of unopened spirit orbs for a card set from a user'
.action (args,callback)->
  username_or_email = args.username_or_email
  fieldName = 'username'
  if username_or_email.indexOf('@') > 0
    fieldName = 'email'
  if username_or_email.indexOf("id:") == 0
    fieldName = 'id'
    username_or_email = username_or_email.replace("id:","")

  if fieldName == 'email' or fieldName == 'username'
    username_or_email = username_or_email.toLowerCase()

  UsersModule ?= require 'server/lib/data_access/users'

  this_obj = {
    fromCardSetId: args.from_card_set_id,
    toCardSetId: args.to_card_set_id,
    numOrbsToConvert: args.num_orbs_to_convert
  }

  return knex("users").where(fieldName,username_or_email).first('id','username','email')
  .bind(this_obj)
  .then (userRow)->

    if not userRow?
      throw new Error("Could not find user")

    if (not @.fromCardSetId? || not SDK.CardSetFactory.cardSetForIdentifier(@.fromCardSetId)?)
      throw new Error("Invalid card set id: #{@.fromCardSetId}")

    if (not @.toCardSetId? || not SDK.CardSetFactory.cardSetForIdentifier(@.toCardSetId)?)
      throw new Error("Invalid card set id: #{@.toCardSetId}")

    if (not @.numOrbsToConvert? || @.numOrbsToConvert <= 0)
      throw new Error("Invalid number of orbs to remove: #{@.numOrbsToConvert}")

    @.userId = userRow.id

    console.log prettyjson.render({
      id:userRow.id
      username:userRow.username
      email:userRow.email
    })

    return confirmAsync("Sure you want to convert #{@.numOrbsToConvert} #{SDK.CardSetFactory.cardSetForIdentifier(@.fromCardSetId).devName} Spirit orbs to #{SDK.CardSetFactory.cardSetForIdentifier(@.toCardSetId).devName} for #{userRow.username}?")
  .then () ->

    txPromise = knex.transaction (tx) =>
      return tx.first().from('users').where('id',@.userId).forUpdate() # Lock user record
      .bind @
      .then (userRow) ->
        @.userRow = userRow

        # First handle db limited orb set counts/validation
        userUnlockableCountNeedsUpdate = false
        userRowUpdateData = {}

        if (SDK.CardSetFactory.cardSetForIdentifier(@.fromCardSetId).isUnlockableThroughOrbs)
          userUnlockableCountNeedsUpdate = true
          @.fromOrbCountKey = "total_orb_count_set_" + @.fromCardSetId
          userRowUpdateData[@.fromOrbCountKey] = @.fromOrbNewCount = @.userRow[@.fromOrbCountKey] - @.numOrbsToConvert
          if userRowUpdateData[@.fromOrbCountKey] < 0
            throw new Error("User orb count for card set #{@.fromCardSetId} would go below 0 by converting #{@.numOrbsToConvert} orbs for user #{@.userId}")

        if (SDK.CardSetFactory.cardSetForIdentifier(@.toCardSetId).isUnlockableThroughOrbs)
          userUnlockableCountNeedsUpdate = true
          @.toOrbCountKey = "total_orb_count_set_" + @.toCardSetId
          userRowUpdateData[@.toOrbCountKey] = @.toOrbNewCount = @.userRow[@.toOrbCountKey] + @.numOrbsToConvert
          if userRowUpdateData[@.toOrbCountKey] > SDK.CardSetFactory.cardSetForIdentifier(@.toCardSetId).numOrbsToCompleteSet
            throw new Error("Adding #{@.numOrbsToConvert} will put user #{@.userRow.id} over the maximum amount of orbs for card set #{@.toCardSetId}")

        if userUnlockableCountNeedsUpdate
          return tx('users').where('id',@.userId).update(userRowUpdateData)
        else
          return Promise.resolve()
      .then ()->
        return tx("user_spirit_orbs").select().where('user_id',@.userId).andWhere('card_set',@.fromCardSetId).limit(@.numOrbsToConvert)
      .then (userSpiritOrbRowsToConvert)->
        if (not userSpiritOrbRowsToConvert?)
          throw new Error("Invalid spirit orb rows")

        if (userSpiritOrbRowsToConvert.length < @.numOrbsToConvert)
          throw new Error("User does not own as many orbs as trying to convert: Owns #{userSpiritOrbRowsToConvert.length} Removing: #{@.numOrbsToConvert}")

        @.userSpiritOrbRowsToConvert = userSpiritOrbRowsToConvert

        @.conversionPushId = generatePushId()
        @.convertedAt = moment.utc().toDate()

        return Promise.map(@.userSpiritOrbRowsToConvert, (spiritOrbRowToConvert) =>
          orbRowUpdateData = {}

          updatedParams = spiritOrbRowToConvert.params or {}
          updatedParams.conversionPushId = @.conversionPushId
          updatedParams.convertedAt = @.convertedAt

          orbRowUpdateData.params = updatedParams
          orbRowUpdateData.card_set = @.toCardSetId

          return tx("user_spirit_orbs").first().where('id',spiritOrbRowToConvert.id).update(orbRowUpdateData)
        )

    # Outside of transaction: firebase updates
    return txPromise
    .bind (this_obj)
    .then ()->
      return DuelystFirebase.connect().getRootRef()
    .then (fbRootRef)->
      # Update limited orb sets in fb
      @.fbRootRef = fbRootRef
      allFbPromises = []
      if (@.fromOrbNewCount?) # May be 0
        allFbPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(@.userId).child('spirit-orb-total').child(@.fromCardSetId),@.fromOrbNewCount))
      if (@.toOrbNewCount?) # May be 0
        allFbPromises.push(FirebasePromises.set(@.fbRootRef.child('user-inventory').child(@.userId).child('spirit-orb-total').child(@.toCardSetId),@.toOrbNewCount))

      return Promise.all(allFbPromises)

    .then ()->
      # Update converted orb card set ids in firebase
      return Promise.map(@.userSpiritOrbRowsToConvert, (spiritOrbRowToConvert) =>
        return FirebasePromises.set(@.fbRootRef.child("user-inventory").child(@.userId).child("spirit-orbs").child(spiritOrbRowToConvert.id).child("card_set"),@.toCardSetId)
      )
    .then ()->
      console.log("User #{@.userId} has had #{@.numOrbsToConvert} orbs of type #{@.fromCardSetId} converted to type #{@.toCardSetId}")
      return UsersModule.inGameNotify(@.userId,"Your Spirit Orbs have been updated, please restart Duelyst to avoid any issues","crm")
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)

program
.command 'users:complete_new_user_progression <username_or_email>'
.description 'updates a user account to have completed the new user progression'
.action (args,callback)->
  UsersModule ?= require 'server/lib/data_access/users'
  ChallengesModule ?= require 'server/lib/data_access/challenges'
  QuestsModule ?= require 'server/lib/data_access/quests'

  username_or_email = args.username_or_email

  fieldName = 'username'
  if username_or_email.indexOf('@') > 0
    fieldName = 'email'
  if username_or_email.indexOf("id:") == 0
    fieldName = 'id'
    username_or_email = username_or_email.replace("id:","")

  if fieldName == 'email' or fieldName == 'username'
    username_or_email = username_or_email.toLowerCase()

  knex("users").where(fieldName,username_or_email).first('id','username','email')
  .bind {}
  .then (userRow)->

    if not userRow?
      throw new Error("Could not find user")

    @.userRow = userRow

    console.log prettyjson.render({
      id:userRow.id
      username:userRow.username
      email:userRow.email
    })
    tutorialChallengePromises = _.map(SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type), (challenge) =>
      return ChallengesModule.completeChallengeWithType(@.userRow.id,challenge.type)
    )
    return Promise.all(tutorialChallengePromises)
  .then ()->
    return UsersModule.setNewPlayerFeatureProgression(@.userRow.id,SDK.NewPlayerProgressionModuleLookup.Core,SDK.NewPlayerProgressionStageEnum.Skipped.key)
  .then ()->
    knex("user_quests").where({'user_id':@.userRow.id}).delete()
  .then ()->
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef) ->
    @.fbRootRef = fbRootRef

    return Promise.all([
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(@.userRow.id).child("daily").child("current").child('quests'))
      FirebasePromises.remove(@.fbRootRef.child("user-quests").child(@.userRow.id).child("catch-up").child("current").child('quests'))
    ])
  .then ()->
    QuestsModule.generateDailyQuests(@.userRow.id)
  .then ()->
    return UsersModule.inGameNotify(@.userRow.id,"Your Player Progression has been updated, please restart Duelyst to avoid any issues","crm")
  .then ()->
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)

program
.command 'users:advance_faction_progression <username_or_email>'
.description 'updates a user\'s faction progression to have all factions at level 11'
.action (args,callback)->
  UsersModule ?= require 'server/lib/data_access/users'

  username_or_email = args.username_or_email

  fieldName = 'username'
  if username_or_email.indexOf('@') > 0
    fieldName = 'email'
  if username_or_email.indexOf("id:") == 0
    fieldName = 'id'
    username_or_email = username_or_email.replace("id:","")

  if fieldName == 'email' or fieldName == 'username'
    username_or_email = username_or_email.toLowerCase()

  knex("users").where(fieldName,username_or_email).first('id','username','email')
  .bind {}
  .then (userRow)->

    if not userRow?
      throw new Error("Could not find user")

    @.userRow = userRow

    console.log prettyjson.render({
      id:userRow.id
      username:userRow.username
      email:userRow.email
    })
    return knex("user_faction_progression").where('user_id',@.userRow.id)
  .then (rows)->
    factionIds = _.map(SDK.FactionFactory.getAllPlayableFactions(), (f)-> return f.id)
    allPromises = []
    for factionId in factionIds
      row = _.find(rows, (r)-> return r.faction_id == factionId)
      if !row?
        allPromises.push(UsersModule.createFactionProgressionRecord(@.userRow.id,factionId,generatePushId(),SDK.GameType.SinglePlayer))
    return Promise.all(allPromises)
  .then () ->
    return knex("user_faction_progression").where('user_id',@.userRow.id)
  .then (factionRows) ->
    factionIds = _.map(SDK.FactionFactory.getAllPlayableFactions(), (f)-> return f.id)
    winsPerFaction = []
    for factionId in factionIds
      row = _.find(factionRows, (r)-> return r.faction_id == factionId)
      if !row?
        return Promise.reject("No row found for faction - #{factionId}")
      else
        factionXp = row.xp
        xpForLevelTen = SDK.FactionProgression.levelXPTable[10]
        neededXp = xpForLevelTen - factionXp
        xpPerWin = SDK.FactionProgression.winXP
        if neededXp > 0
          neededWins = Math.ceil(neededXp / xpPerWin)
          winsPerFaction = winsPerFaction.concat(Array(neededWins).fill(factionId))
    return Promise.each(winsPerFaction, (factionId) =>
      return UsersModule.updateUserFactionProgressionWithGameOutcome(@.userRow.id,factionId,true,generatePushId(),SDK.GameType.Ranked)
    )
  .then ()->
    return UsersModule.inGameNotify(@.userRow.id,"Your Faction Progression has been updated, please restart Duelyst to avoid any issues","crm")
  .then ()->
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)


# unlocks generals by completing achievements for generals for user
program
.command 'users:unlock_wartech_generals <username_or_email>'
.description 'updates a user\'s achievements to complete the wartech general achievements'
.action (args,callback)->
  UsersModule ?= require 'server/lib/data_access/users'
  AchievementsModule ?= require 'server/lib/data_access/achievements'

  username_or_email = args.username_or_email

  fieldName = 'username'
  if username_or_email.indexOf('@') > 0
    fieldName = 'email'
  if username_or_email.indexOf("id:") == 0
    fieldName = 'id'
    username_or_email = username_or_email.replace("id:","")

  if fieldName == 'email' or fieldName == 'username'
    username_or_email = username_or_email.toLowerCase()

  knex("users").where(fieldName,username_or_email).first('id','username','email')
  .bind {}
  .then (userRow)->

    if not userRow?
      throw new Error("Could not find user")

    @.userRow = userRow

    console.log prettyjson.render({
      id:userRow.id
      username:userRow.username
      email:userRow.email
    })
    return knex("user_achievements").where('user_id',@.userRow.id)
  .then (achievementRows)->
    userAchievementRowsById = {}

    if achievementRows?
      userAchievementRowsById = _.object(_.map(achievementRows, (row)->return row.achievement_id),achievementRows)

    allPromises = []
    createPromiseToCompleteAchievementId = (achievementId,userCurrentAchievementProgressById) =>
      currentAchievementData = userCurrentAchievementProgressById[achievementId]
      sdkAchievement = SDK.AchievementsFactory.achievementForIdentifier(achievementId)
      progressNeededToCompleteAchievement = null
      if currentAchievementData?
        if currentAchievementData.completed_at? or (currentAchievementData.progress == sdkAchievement.progressRequired)
          progressNeededToCompleteAchievement = 0
        else
          progressNeededToCompleteAchievement = sdkAchievement.progressRequired - currentAchievementData.progress
      else
        progressNeededToCompleteAchievement = sdkAchievement.progressRequired


      console.log("User needs #{progressNeededToCompleteAchievement} progress to complete #{achievementId} achievement.")
      if (progressNeededToCompleteAchievement != 0)
        achProgressMap = {}
        achProgressMap[achievementId] = progressNeededToCompleteAchievement
        return AchievementsModule._applyAchievementProgressMapToUser(@.userRow.id,achProgressMap)
      else
        return Promise.resolve()

    allPromises.push(createPromiseToCompleteAchievementId(WartechGeneralFaction1Achievement.getId(),userAchievementRowsById))
    allPromises.push(createPromiseToCompleteAchievementId(WartechGeneralFaction2Achievement.getId(),userAchievementRowsById))
    allPromises.push(createPromiseToCompleteAchievementId(WartechGeneralFaction3Achievement.getId(),userAchievementRowsById))
    allPromises.push(createPromiseToCompleteAchievementId(WartechGeneralFaction4Achievement.getId(),userAchievementRowsById))
    allPromises.push(createPromiseToCompleteAchievementId(WartechGeneralFaction5Achievement.getId(),userAchievementRowsById))
    allPromises.push(createPromiseToCompleteAchievementId(WartechGeneralFaction6Achievement.getId(),userAchievementRowsById))

    return Promise.all(allPromises)
  .then () ->
    return UsersModule.inGameNotify(@.userRow.id,"Your Achievement Progress has been updated, please restart Duelyst","crm")
  .then ()->
    console.log("Wartech achievements have been set to complete and in game notify is sent.".green)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)


###
program
  .command 'retention_gifts:send <weeks_back>'
  .description 'send out retention gift box emails'
  .action (args,callback)->

    weeksBack = args.weeks_back || 2

    # data access modules
    console.log("loading modules...")
    InventoryModule ?= require 'server/lib/data_access/inventory'
    GiftCrateModule ?= require 'server/lib/data_access/gift_crate'
    GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
    if not mailer?
      mailer ?= require 'server/mailer'
      Promise.promisifyAll(mailer)
    console.log("loading modules... "+"DONE".green)

    startOfThisWeek = moment.utc().startOf('week')
    startOfPeriod = startOfThisWeek.clone().add(-(weeksBack+1),'weeks')
    endOfPeriod = startOfThisWeek.clone().add(-weeksBack,'weeks')

    console.log "looking for users registered between #{startOfPeriod.format("YYYY-MM-DD")} and #{endOfPeriod.format("YYYY-MM-DD")}"

    knex("users").select("id","username","email","created_at","last_session_at","session_count","top_rank","experiment_groups").whereRaw(
      "created_at < ? AND created_at > ? AND last_session_at - created_at < '7 days' AND (session_count > 1 OR top_rank < 30) AND last_retention_gift_at IS NULL AND (experiment_groups IS NULL OR NOT ('manual_retention_box' = ANY(experiment_groups)))",
      [
        endOfPeriod,
        startOfPeriod
      ]
    )
    .bind {}
    .then (userRows)->
      @.userRows = userRows
      console.log(prettyjson.render(userRows))
      console.log("Found #{userRows.length} eligible users")
      return confirmAsync("Ready to start sending retention gifts + emails?")
    .then ()->
      @.sentCounter = 0
      processUser = (user)=>
        user.experiment_groups ?= []
        user.experiment_groups.push('manual_retention_box')
        if Math.random() > 0.8
          console.log "... skipping user #{user.id}".yellow
          return knex('users').where('id', user.id).update({
            experiment_groups: user.experiment_groups
          })
        else
          @.sentCounter += 1
          return knex.transaction (tx)=>
            return Promise.all([
              tx('users').where('id', user.id).update({
                last_retention_gift_at: moment().utc().toDate()
                experiment_groups: user.experiment_groups
              }),
              GiftCrateModule.addGiftCrateToUser(Promise.resolve(true), tx, user.id, GiftCrateLookup.SevenDayMysteryBox),
              mailer.sendGiftCrateAsync(user.username, user.email)
            ])
      return Promise.map(@.userRows, processUser, {concurrency:1})
    .then ()->
      console.log "sent to #{@.sentCounter} of #{@.userRows.length} users registered between #{startOfPeriod.format("YYYY-MM-DD")} and #{endOfPeriod.format("YYYY-MM-DD")}".cyan
      console.log "DONE".green
      callback()
    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback()
    .catch (e)->
      console.log prettyError.render(e)
      callback()

program
  .command 'retention_gifts:report <weeks_back>'
  .description ''
  .action (args,callback)->

    weeksBack = args.weeks_back || 2

    # data access modules
    console.log("loading modules...")
    InventoryModule ?= require 'server/lib/data_access/inventory'
    GiftCrateModule ?= require 'server/lib/data_access/gift_crate'
    GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
    if not mailer?
      mailer ?= require 'server/mailer'
      Promise.promisifyAll(mailer)
    console.log("loading modules... "+"DONE".green)

    startOfThisWeek = moment.utc().startOf('week')
    startOfPeriod = startOfThisWeek.clone().add(-(weeksBack+1),'weeks')
    endOfPeriod = startOfThisWeek.clone().add(-weeksBack,'weeks')

    console.log "looking for users registered between #{startOfPeriod.format("YYYY-MM-DD")} and #{endOfPeriod.format("YYYY-MM-DD")}"

    Promise.all([
      knex("users").select("id","created_at","last_session_at","last_retention_gift_at").whereRaw(
        "created_at < ? AND created_at > ? AND last_retention_gift_at IS NOT NULL AND 'manual_retention_box' = ANY(experiment_groups)",
        [
          endOfPeriod,
          startOfPeriod
        ]
      ),
      knex("users").select("id","created_at","last_session_at","last_retention_gift_at").whereRaw(
        "created_at < ? AND created_at > ? AND last_retention_gift_at IS NULL AND 'manual_retention_box' = ANY(experiment_groups)",
        [
          endOfPeriod,
          startOfPeriod
        ]
      )
    ])
    .bind {}
    .spread (userRows,noRetentionGiftUserRows)->
      seenAfter = _.filter(userRows,(u)-> return u.last_session_at - u.last_retention_gift_at > 0)
      seenAfterNoRetention = _.filter(noRetentionGiftUserRows,(u)-> return u.last_session_at - userRows[0].last_retention_gift_at > 0)
      console.log("#{seenAfter.length} / #{userRows.length} users vs. #{seenAfterNoRetention.length} / #{noRetentionGiftUserRows.length}")
      callback()
    .catch (e)->
      console.log prettyError.render(e)
      callback()
###
program
  .command 'users:manage <username_or_email>'
  .description 'manage a user based on username or email'
  .action (args,callback)->

    username_or_email = args.username_or_email
    username_or_email = username_or_email.toLowerCase()

    # data access modules
    console.log("loading modules...")
    InventoryModule ?= require 'server/lib/data_access/inventory'
    UsersModule ?= require 'server/lib/data_access/users'
    SyncModule ?= require 'server/lib/data_access/sync'
    CosmeticChestsModule ?= require 'server/lib/data_access/cosmetic_chests'
    GiftCrateModule ?= require 'server/lib/data_access/gift_crate'
    GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
    console.log("loading modules... "+"DONE".green)

    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")
    knex("users").where(fieldName,username_or_email).first()
    .bind {}
    .then (userRow)->

      console.log prettyjson.render(_.pick(userRow,["id","email","username"]))

      if not userRow?
        throw new Error("Could not find user")

      @.userRow = userRow

      return inquirerPromisifed.prompt [{
        name:'operation'
        message:"Managing #{userRow.username} - What would you like to do?"
        type:"list"
        choices:[
          "CANCEL".red,new inquirer.Separator(),
          "Give "+"GOLD".yellow,
          "Give "+"SPIRIT".cyan,
          "Give Spirit Orbs",
          "Give Gauntlet Tickets",
          "Give User Cosmetic",
          "Give Ribbon",
          "Give User Mystery Crate",
          "Give User Mystery Crate Key",
          "Give User Retention Gift Crate",
          "Change Email",
          "Change Username",
          new inquirer.Separator("== misc =="),
          "Suspend",
          "UN-Suspend",
          "Send In-Game Notification",
          new inquirer.Separator("== maintenance =="),
          "Force Firebase SYNC"
        ]
      }]

    .then (answers)->

        if answers.operation == "CANCEL".red

          callback()
          # process.exit(0)

        else if answers.operation == "Give "+"GOLD".yellow

          return inquirerPromisifed.prompt [{
            name:'amount'
            message:"How much?"
            type:"input"
            validate:(input)-> return validator.isNumeric(input)
          }]
          .bind @
          .then (answer)->
            @.amount = answer.amount
            return confirmAsync("Sure you want to give #{answer.amount.yellow} GOLD to #{@.userRow.username}?")
          .then ()->
            userId = @.userRow.id
            amount = @.amount
            return knex.transaction (tx)->
              return InventoryModule.giveUserGold(null,tx,userId,parseInt(amount),"CRM")

        else if answers.operation == "Give "+"SPIRIT".cyan

          return inquirerPromisifed.prompt [{
            name:'amount'
            message:"How much?"
            type:"input"
            validate:(input)-> return validator.isNumeric(input)
          }]
          .bind @
          .then (answer)->
            @.amount = answer.amount
            return confirmAsync("Sure you want to give #{answer.amount.cyan} SPIRIT to #{@.userRow.username}?")
          .then ()->
            userId = @.userRow.id
            amount = @.amount
            return knex.transaction (tx)->
              return InventoryModule.giveUserSpirit(null,tx,userId,parseInt(amount),"CRM")

        else if answers.operation == "Give User Cosmetic"

          return inquirerPromisifed.prompt [{
            name:'cosmetic'
            message:"Which Cosmetic (ID or SKU)?"
            type:"input"
            validate:(input)->
              if SDK.CosmeticsFactory.cosmeticForIdentifier(input)? || SDK.CosmeticsFactory.cosmeticForSku(input)?
                return true
              else
                return false
          }]
          .bind @
          .then (answer)->
            cosmetic = SDK.CosmeticsFactory.cosmeticForIdentifier(answer.cosmetic) || SDK.CosmeticsFactory.cosmeticForSku(answer.cosmetic)
            console.log("found cosmetic: #{cosmetic.sku} (#{cosmetic.id})")
            if not cosmetic?
              throw new Errors.NotFoundError("Cosmetic not found")
            if !cosmetic.enabled
              throw new Errors.BadRequestError("This cosmetic is disabled")
            @.cosmeticId = cosmetic.id
            return confirmAsync("Sure you want to give #{cosmetic.sku} cosmetic to #{@.userRow.username}?")
          .then ()->
            userId = @.userRow.id
            cosmeticId = @.cosmeticId
            return knex.transaction (tx)->
              return InventoryModule.giveUserCosmeticId(Promise.resolve(),tx,userId,cosmeticId,"CRM","crm")

        else if answers.operation == "Give User Mystery Crate"

          return inquirerPromisifed.prompt [{
            name:'crateType'
            message:"Which Mystery Crate Type (bronze/gold/platinum)?"
            type:"input"
            validate:(input)->
              return _.contains(_.values(SDK.CosmeticsChestTypeLookup),input)
          },{
            name:'amount'
            message:"How many chests do you want to give (User can hold max 5 of each type)?"
            type:"input"
            validate:(input)-> return validator.isNumeric(input)
          }]
          .bind @
          .then (answer)->
            @.crateType = answer.crateType
            @.amount = answer.amount

            return confirmAsync("Sure you want to give #{@.amount} #{@.crateType} Mystery Crates to #{@.userRow.username}?")
          .then ()->
            crateType = @.crateType
            amount = @.amount
            userId = @.userRow.id
            txPromise = knex.transaction (tx)->
              return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,crateType,null,null,amount,"CRM","crm")
            return txPromise

        else if answers.operation == "Give User Mystery Crate Key"

          return inquirerPromisifed.prompt [{
            name:'crateKeyType'
            message:"Which Mystery Crate Key Type (bronze/gold/platinum)?"
            type:"input"
            validate:(input)->
              return _.contains(_.values(SDK.CosmeticsChestTypeLookup),input)
          },{
            name:'amount'
            message:"How many keys do you want to give?"
            type:"input"
            validate:(input)-> return validator.isNumeric(input)
          }]
          .bind @
          .then (answer)->
            @.crateKeyType = answer.crateKeyType
            @.amount = answer.amount

            return confirmAsync("Sure you want to give #{@.amount} #{@.crateKeyType} Mystery Crate Keys to #{@.userRow.username}?")
          .then ()->
            crateKeyType = @.crateKeyType
            amount = @.amount
            userId = @.userRow.id
            txPromise = knex.transaction (tx)->
              return CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,crateKeyType,amount,"CRM","crm")
            return txPromise

        else if answers.operation == "Give User Retention Gift Crate"

          userId = @.userRow.id
          return knex.transaction (tx)->
            return GiftCrateModule.addGiftCrateToUser(Promise.resolve(true), tx, userId, GiftCrateLookup.SevenDayMysteryBox)

        else if answers.operation == "Give Ribbon"

          return inquirerPromisifed.prompt [{
            name:'ribbon'
            message:"Which Ribbon (tournament_winner, ...)?"
            type:"input"
            validate:(input)->
              if SDK.RibbonFactory.ribbonForIdentifier(input)?
                return true
              else
                return false
          }]
          .bind @
          .then (answer)->
            ribbon = SDK.RibbonFactory.ribbonForIdentifier(answer.ribbon)
            if not ribbon?
              throw new Errors.NotFoundError("Ribbon not found")
            if !ribbon.enabled
              throw new Errors.BadRequestError("This ribbon is disabled")
            @.ribbonId = ribbon.id
            return confirmAsync("Sure you want to give #{ribbon.title} #{@.userRow.username}?")
          .then ()->
            userId = @.userRow.id
            ribbonId = @.ribbonId

            @.ribbon =
              user_id: userId
              ribbon_id: ribbonId
              created_at: moment.utc().toDate()

            console.log("adding ribbon: ",@.ribbon)

            return knex("user_ribbons").insert(@.ribbon)
          .then ()-> DuelystFirebase.connect().getRootRef()
          .then (rootRef)->
            ribbonData = _.omit(@.ribbon,["user_id"])
            ribbonData = DataAccessHelpers.restifyData(ribbonData)
            return FirebasePromises.safeTransaction(rootRef.child('user-ribbons').child(@.userRow.id).child(ribbonData.ribbon_id),(data)->
              data ?= {}
              data.ribbon_id ?= ribbonData.ribbon_id
              data.updated_at = ribbonData.created_at
              data.count ?= 0
              data.count += 1
              return data
            )

        else if answers.operation == "Give Spirit Orbs"

          return inquirerPromisifed.prompt [{
            name:'amount'
            message:"How many (max 40)?"
            type:"input"
            validate:(input)-> return validator.isNumeric(input) and parseInt(input) <= 40 and parseInt(input) > 0
          }]
          .bind @
          .then (answer)->
            @.amount = answer.amount

            return inquirerPromisifed.prompt [{
              name:'card_set'
              message:"Any specific Card Set (core:1 shimzar:2 unearthed:5 immortal:6 ancient:7 8:mythron)? ENTER to default to core set."
              type:"input"
            }]
          .then (answer)->
            @.card_set = answer.card_set || 1
            @.card_set = parseInt(@.card_set)
            unless @.card_set == 1 || @.card_set == 2 || @.card_set == 5 || @.card_set == 6 || @.card_set == 7 || @.card_set == 8
              throw new Error("Invalid Card Set")
            return confirmAsync("Sure you want to give #{@.amount.yellow} SPIRIT ORBS of card set #{@.card_set} to #{@.userRow.username}?")
          .then ()->
            userId = @.userRow.id
            amount = @.amount
            cardSet = @.card_set
            return knex.transaction (tx)->
              allPromises = []
              for [0...amount]
                allPromises.push InventoryModule.addBoosterPackToUser(null,tx,userId,cardSet,"CRM")
              return Promise.all(allPromises)

        else if answers.operation == "Send In-Game Notification"

          return inquirerPromisifed.prompt [{
            name:'message'
            message:"Message:"
            type:"input"
            validate:(input)-> return validator.isLength(input,2)
          }]
          .bind @
          .then (answer)->
            return UsersModule.inGameNotify(@.userRow.id,answer.message)

        else if answers.operation == "Suspend"

          return confirmAsync("Sure you want to #{"SUSPEND".red} this user #{@.userRow?.id}?")
          .bind @
          .then ()->
            return inquirerPromisifed.prompt [{
              name:'message'
              message:"Why is this user suspended (max 255 chars):"
              type:"input"
              validate:(input)-> return validator.isLength(input,2,255)
            }]
          .then (answer)->
            return UsersModule.suspendUser(@.userRow.id,answer.message)

        else if answers.operation == "UN-Suspend"

          return confirmAsync("Sure you want to #{"UN-SUSPEND".red} this user #{@.userRow?.id}?")
          .bind @
          .then ()->
            return knex("users").where('id',@.userRow.id).update({
              is_suspended: false
            })

        else if answers.operation == "Change Username"

          return inquirerPromisifed.prompt [{
            name:'username'
            message:"New Username:"
            type:"input"
            validate:(input)-> return validator.isLength(input,3, 18) && validator.isAlphanumeric(input)
          }]
          .bind @
          .then (answer)->

            console.log("changing username to #{answer.username}")
            return UsersModule.changeUsername(@.userRow.id,answer.username.toLowerCase(),true)

        else if answers.operation == "Force Firebase SYNC"

          return confirmAsync("Sure you want to re-sync this user #{@.userRow?.id} to Firebase #{config.get('firebase').cyan}?")
          .bind @
          .then ()->
            return SyncModule._syncUserFromSQLToFirebase(@.userRow.id)

        else

          console.log("unknown command".red)
          callback()
          # process.exit(0)

    .then ()->

      console.log("DONE".green)
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback()
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback()
      # process.exit(1)
###
program
.command 'users:snapshot <username_or_email>'
.description 'writes user\'s snapshot data to userSnapshots directory'
.action (args,callback)->
  username_or_email = args.username_or_email
  username_or_email = username_or_email.toLowerCase()

  fieldName = 'username'
  if username_or_email.indexOf('@') > 0
    fieldName = 'email'
  if username_or_email.indexOf("id:") == 0
    fieldName = 'id'
    username_or_email = username_or_email.replace("id:","")


  UsersModule ?= require 'server/lib/data_access/users'

  return knex("users").where(fieldName,username_or_email).first('id','username','email')
  .bind({})
  .then (userRow)->
    @.userRow = userRow
    if not @.userRow?
      throw new Error("Could not find user")

    console.log prettyjson.render({
      id:@.userRow.id
      username:@.userRow.username
      email:@.userRow.email
    })

    return UsersModule.___snapshotUserData(@.userRow.id)
  .then (userSnapshot)->
    console.log("Retrieved snapshot for user ID #{@.userRow.id}".green)
    outputDir = "./userSnapshots/"
    snapshotFileName = @.userRow.id + ":" + (moment().utc().format('YYYYMMDDHHMMSS')) + ".json"
    @.outputFileLocation = outputDir + snapshotFileName
    return helpers.writeFile(@.outputFileLocation,JSON.stringify(userSnapshot,null,2))
  .then ()->
    console.log("DONE: Snapshot written to #{@.outputFileLocation}".green)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)
###

program
  .command 'charges:info <charge_id>'
  .description 'get charge details'
  .action (args,callback)->
    charge_id = args.charge_id
    knex("user_charges").where('charge_id',charge_id).first().then (row)->

      if not row?
        throw new Error("Could not find row")

      console.log prettyjson.render(row)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'referral_codes'
  .description 'list referral codes'
  .action (args,callback)->

    knex("referral_codes").select()
    .bind {}
    .then (rows)->

      for r in rows
        r.params = JSON.stringify(r.params)

      logAsTable(rows)
      callback()
      # process.exit(0)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'referral_codes:info <code>'
  .description 'list referral code info for code'
  .action (args,callback)->

    code = args.code

    knex("referral_codes").where('code',code).select()
    .bind {}
    .then (rows)->

      for r in rows
        r.params = JSON.stringify(r.params)

      logAsTable(rows)
      callback()
      # process.exit(0)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'referral_codes:add <code>'
  .description 'add a referral code'
  .action (args,callback)->

    code = args.code
    code = code?.toLowerCase()
    code = code?.trim()

    if not validator.isLength(code,4)
      throw new Error("invite code must be 4 chars long minimum")
    knex("referral_codes").where('code',code).first()
    .bind {}
    .then (row)->

      if row?
        throw new Error("Code already exists")

      @.code = { code:code }

      return inquirerPromisifed.prompt [{
        name:'gold'
        message:"How much bonus gold for code #{code}?"
        type:"input"
        validate:(input)-> return input == null || input == '' || validator.isNumeric(input)
      }]

    .then (answers)->

      if answers.gold? and answers.gold != '' and answers.gold > 0
        @.code.params = { gold: parseInt(answers.gold) }

      return inquirerPromisifed.prompt [{
        name:'signup_limit'
        message:"How many max signups for #{code}?"
        type:"input"
        validate:(input)-> return input == null || input == '' || validator.isNumeric(input)
      }]

    .then (answers)->

      if answers.signup_limit? and answers.signup_limit != '' and answers.signup_limit > 0
        @.code.signup_limit = parseInt(answers.signup_limit)

      return inquirerPromisifed.prompt [{
        name:'day_limit'
        message:"How many days should #{code} last for?"
        type:"input"
        validate:(input)-> return input == null || input == '' || validator.isNumeric(input)
      }]

    .then (answers)->

      if answers.day_limit? and answers.day_limit != '' and answers.day_limit > 0
        @.code.expires_at = moment().utc().add(answers.day_limit,'days').toDate()

      return confirmAsync("Create code #{JSON.stringify(@.code)}?")

    .then ()->

      return knex("referral_codes").insert(@.code)

    .then ()->

      console.log("DONE".green)
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'referral_codes:renew <code> [days]'
  .description 'renew a referral for (30 default) days code'
  .action (args,callback)->

    code = args.code
    days = args.days || 30
    code = code?.toLowerCase()
    code = code?.trim()

    if not validator.isLength(code,4)
      throw new Error("invite code must be 4 chars long minimum")
    knex("referral_codes").where('code',code).first()
    .bind {}
    .then (row)->

      if not row?
        throw new Errors.NotFoundError("Code not found")

      expireMoment = moment.utc(row.expires_at)
      console.log "Expires at: #{expireMoment.format()}"
      updatedExpireMoment = expireMoment.add(days,'days')
      console.log "Now expires at: #{updatedExpireMoment.format()}"

      return knex("referral_codes").where('code',code).update(
        expires_at:updatedExpireMoment.toDate()
      )

    .then (c)->

      console.log("DONE. Updated #{c}".green)
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'referral_codes:add_for_twitch <codes>'
  .description 'add a comma seperated list of codes with params pre-set for streamers'
  .action (args,callback)->

    codes = args.codes

    knex.transaction (tx)->

      codesList = codes.split(',')

      confirmAsync("Create code #{JSON.stringify(codesList)}?")
      .then ()->
        allPromises = []
        for code in codesList

          code = code.trim()
          code = code.toLowerCase()
          if not validator.isLength(code,4)
            throw new Error("invite code must be 4 chars long minimum")

          p = tx("referral_codes").where('code',code).first()
          .bind { codeToAdd:code }
          .then (row)->

            if row?
              throw new Error("Code already exists")

            console.log "adding code #{@.codeToAdd}"

            @.code = { code: @.codeToAdd }
            @.code.params = { gold: 100 }
            @.code.expires_at = moment().utc().add(30,'days').toDate()
            return tx("referral_codes").insert(@.code)

          allPromises.push p

        return Promise.all(allPromises)
      .then tx.commit
      .catch tx.rollback

    .then ()->

      console.log("DONE".green)
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'paypal:transaction <id> [detailed]'
  .description 'get paypal transaction info'
  .action (args,callback)->

    id = args.id
    detailed = args.detailed
    PaypalExpress = require('paypal-express')

    if not config.get("paypalNvpApi.username")
      return callback(new Error("No Paypal NVP API Credentials set"))

    request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
    Promise.promisifyAll(request)

    request.makeRequestAsync({
      'METHOD': 'GetTransactionDetails',
      "TRANSACTIONID": id
    }).then (response)->

      item = PaypalTools.paypalNvpTransactionResponseToObject(response)
      unless detailed
        item = _.pick(item,["PAYMENTSTATUS","EMAIL","L_NAME0","L_NUMBER0","CUSTOM","ORDERTIME","AMT"])
      console.log prettyjson.render(item)
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->

      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)
###
# program
#   .command 'paypal:resolve <id> [bonus_gold]'
#   .description 'resolve paypal transaction if "COMPLETED"'
#   .action (args,callback)->
#
#     id = args.id
#     bonus_gold = args.bonus_gold
#     bonus_gold ?= 100
#
#     console.log "bonus_gold: ",bonus_gold
#
#     PaypalExpress = require('paypal-express')
#
#     if not config.get("paypalNvpApi.username")
#       return callback(new Error("No Paypal NVP API Credentials set"))
#
#     request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
#     Promise.promisifyAll(request)
#
#     this_obj = {}
#
#     knex("user_charges").first().where('charge_id',id)
#     .bind this_obj
#     .then (chargeRow)->
#
#       console.log "charge row: ",chargeRow
#
#       if chargeRow?
#         throw new Errors.AlreadyExistsError("This transaction already seems to be processed")
#
#       return request.makeRequestAsync({
#         'METHOD': 'GetTransactionDetails',
#         "TRANSACTIONID": id
#       })
#     .then (response)->
#
#       item = PaypalTools.paypalNvpTransactionResponseToObject(response)
#       itemSimple = _.pick(item,["PAYMENTSTATUS","EMAIL","L_NAME0","L_NUMBER0","CUSTOM","ORDERTIME","AMT"])
#       console.log prettyjson.render(itemSimple)
#
#       # email to send a notification of resolution to
#       @.email = item["EMAIL"]
#
#       InventoryModule ?= require 'server/lib/data_access/inventory'
#       if item["PAYMENTSTATUS"] == "Completed"
#
#         amount = parseInt(item["L_NUMBER0"].replace("BOOSTER",""))
#         price = Math.ceil(parseFloat(item["AMT"])*100)
#         userId = item["CUSTOM"]
#
#         @.boosterCount = amount
#
#         if not amount
#           throw new Error("Invalid Booster Count: #{amount}")
#
#         console.log "Giving user #{amount} boosters for price #{price}"
#
#         return confirmAsync("Give user #{amount} boosters for price #{price} + #{bonus_gold} bonus gold?")
#         .then ()->
#           return knex.transaction (tx)->
#             tx("users").where('id',userId).first().forUpdate().transacting(tx)
#             .bind this_obj
#             .then (userRow)->
#               @.username = userRow["username"]
#               allPromises = []
#               for [0...amount]
#                 allPromises.push InventoryModule.addBoosterPackToUser(null,tx,userId,1,"CRM - paypal resolved",id)
#
#               if bonus_gold > 0
#                 allPromises.push InventoryModule.giveUserGold(null,tx,userId,parseInt(bonus_gold),"CRM - paypal #{id}")
#
#               allPromises.push knex("users").where('id',userId).update(
#                 ltv:          userRow.ltv + price
#                 purchase_count:      userRow.purchase_count + 1
#                 last_purchase_at:    moment(item["ORDERTIME"]).utc().toDate()
#               ).transacting(tx)
#               allPromises.push knex("user_charges").insert(
#                 charge_id:id,
#                 user_id:userId,
#                 created_at:moment(item["ORDERTIME"]).utc().toDate()
#                 currency:'usd'
#                 charge_json:item
#                 amount:price
#               ).transacting(tx)
#               return Promise.all(allPromises)
#
#     .then ()->
#
#       if @.boosterCount
#
#         if not mailer?
#           mailer ?= require 'server/mailer'
#           Promise.promisifyAll(mailer)
#
#         console.log "Email sent to #{@.email}".green
#         return mailer.sendMailAsync(@.username,@.email,"Purchase #{id}","Your purchase for #{@.boosterCount} SPIRIT ORBS was processed and we've awarded you #{bonus_gold} BONUS GOLD for the delay and inconvenience. We apologize for the delay, but your transaction was marked as UNVERIFIED so it required a manual check on our end. Please contact support if you have any further issue or questions.")
#
#     .then ()->
#
#       console.log "ALL DONE.".green
#       callback()
#       # process.exit(0)
#
#     .catch DidNotConfirmError, (e)->
#
#       console.log(e.message)
#       callback(e)
#       # process.exit(1)
#
#     .catch (e)->
#
#       console.log prettyError.render(e)
#       callback(e)
#       # process.exit(1)
###
program
  .command 'paypal:resolve_all'
  .description 'resolve paypal transaction if "COMPLETED"'
  .action (args,callback)->

    bonus_gold = 100

    console.log "bonus_gold: ",bonus_gold

    PaypalExpress = require('paypal-express')

    if not config.get("paypalNvpApi.username")
      return callback(new Error("No Paypal NVP API Credentials set"))

    console.log("Paypal SANDBOX enabled: #{config.get('paypalNvpApi.sandbox')}".cyan)

    request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
    request.useSandbox(config.get('paypalNvpApi.sandbox'))
    Promise.promisifyAll(request)

    this_obj = {}

    knex("paypal_ipn_errors").whereNull('resolved_at').andWhere('created_at','>',moment().utc().subtract(5,'days').toDate()).select()
    .then (paypalErrorRows)->
      console.log "processing #{paypalErrorRows.length} errors"
      return Promise.map(paypalErrorRows, (errorRow)->
        return knex("user_charges").first().where('charge_id',errorRow.transaction_id)
        .bind this_obj
        .then (chargeRow)->
          # if chargeRow?
          #   throw new Errors.AlreadyExistsError("This transaction already seems to be processed")
          return request.makeRequestAsync({
            'METHOD': 'GetTransactionDetails',
            "TRANSACTIONID": errorRow.transaction_id
          })
        .then (response)->
          item = PaypalTools.paypalNvpTransactionResponseToObject(response)
          itemSimple = _.pick(item,["TRANSACTIONID","PAYMENTSTATUS","EMAIL","L_NAME0","L_NUMBER0","CUSTOM","ORDERTIME","AMT"])
          # email to send a notification of resolution to
          @.email = item["EMAIL"]
          @.boosterCount = null
          InventoryModule ?= require 'server/lib/data_access/inventory'
          PaypalModule ?= require 'server/lib/data_access/paypal'

          if item["PAYMENTSTATUS"] == "Completed" and parseFloat(item["AMT"]) > 0 and item["CUSTOM"]?
            console.log prettyjson.render(itemSimple)
            return confirmAsync("Does above look like it needs RESOLUTION?")
            .bind this_obj
            .then ()->
              return inquirerPromisifed.prompt [{
                name:'amount'
                message:"How much BONUS gold?"
                type:"input"
                validate:(input)-> return validator.isNumeric(input)
              }]
              .bind @
            .then (answer)->
              bonus_gold = answer.amount
              paypalBody = errorRow.body_json
              userId = paypalBody.custom
              gross = paypalBody.payment_gross || paypalBody.mc_gross

              console.log "Giving user #{userId} sku #{paypalBody.item_number} for price #{gross}"
              return confirmAsync("Give user #{userId} sku #{paypalBody.item_number} for price #{gross} + #{bonus_gold} bonus gold?")
              .bind this_obj
              .then ()->
                return PaypalModule.processVerifiedPaypalInstantPaymentNotificationData(paypalBody)
              .then ()->
                return knex.transaction (tx)->
                  tx("users").where('id',userId).first().forUpdate().transacting(tx)
                  .bind this_obj
                  .then (userRow)->
                    allPromises = []
                    if bonus_gold > 0
                      allPromises.push InventoryModule.giveUserGold(null,tx,userId,parseInt(bonus_gold),"CRM - paypal #{errorRow.transaction_id}")

                    allPromises.push tx("paypal_ipn_errors").where('transaction_id',errorRow.transaction_id).update(
                      resolved_at:    moment().utc().toDate()
                    )
                    return Promise.all(allPromises)
              .then ()->
                if not mailer?
                  mailer ?= require 'server/mailer'
                  Promise.promisifyAll(mailer)
                console.log "Email sent to #{@.email}".green
                return mailer.sendMailAsync(@.username,@.email,"DUELYST Purchase #{errorRow.transaction_id} Resolved","Your DUELYST purchase was processed and we've awarded you #{bonus_gold} BONUS GOLD for the delay and inconvenience. We apologize for the delay, but your transaction was marked as UNVERIFIED so it required a manual check on our end. Please contact support if you have any further issue or questions.")

            .catch DidNotConfirmError, (e)-> console.log "moving on ..."
        .then ()-> console.log "RESOLVED tx #{errorRow.transaction_id}".green
        .catch Errors.AlreadyExistsError, (e)->
          console.log "Transaction #{errorRow.transaction_id} already processed. Marking IPN Error as RESOLVED.".yellow
          return knex("paypal_ipn_errors").where('transaction_id',errorRow.transaction_id).update(
            resolved_at:    moment().utc().toDate()
          )
      ,{concurrency:1})
    .then ()->
      console.log "ALL DONE.".green
      callback()
      # process.exit(0)
    .catch DidNotConfirmError, (e)->
      console.log(e.message)
      callback(e)
      # process.exit(1)
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'paypal:refund <id> [bonus_gold]'
  .description 'refund a paypal transaction and remove unused orbs'
  .action (args,callback)->

    id = args.id
    bonus_gold = args.bonus_gold || 100

    PaypalExpress = require('paypal-express')

    if not config.get("paypalNvpApi.username")
      return callback(new Error("No Paypal NVP API Credentials set"))

    request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
    Promise.promisifyAll(request)

    knex("user_charges").first().where('charge_id',id)
    .then (chargeRow)->

      console.log "charge row: ",chargeRow

      if chargeRow?
        throw new Errors.AlreadyExistsError("This transaction already seems to be processed")

      return request.makeRequestAsync({
        'METHOD': 'GetTransactionDetails',
        "TRANSACTIONID": id
      })
    .then (response)->

      item = PaypalTools.paypalNvpTransactionResponseToObject(response)
      itemSimple = _.pick(item,["PAYMENTSTATUS","EMAIL","L_NAME0","L_NUMBER0","CUSTOM","ORDERTIME","AMT"])
      console.log prettyjson.render(itemSimple)

      InventoryModule ?= require 'server/lib/data_access/inventory'
      if item["PAYMENTSTATUS"] == "Completed"

        amount = parseInt(item["L_NUMBER0"].replace("BOOSTER",""))
        price = Math.ceil(parseFloat(item["AMT"])*100)
        userId = item["CUSTOM"]

        if not amount
          throw new Error("Invalid Booster Count: #{amount}")

        console.log "Giving user #{amount} boosters for price #{price}"

        return confirmAsync("Give user #{amount} boosters for price #{price} + #{bonus_gold} bonus gold?")
        .then ()->
          return knex.transaction (tx)->
            tx("users").where('id',userId).first().forUpdate().transacting(tx)
            .then (userRow)->
              allPromises = []
              for [0...amount]
                allPromises.push InventoryModule.addBoosterPackToUser(null,tx,userId,1,"CRM - paypal resolved",id)

              allPromises.push InventoryModule.giveUserGold(null,tx,userId,parseInt(bonus_gold),"CRM - paypal #{id}")
              allPromises.push knex("users").where('id',userId).update(
                ltv:          userRow.ltv + price
                purchase_count:      userRow.purchase_count + 1
                last_purchase_at:    moment(item["ORDERTIME"]).utc().toDate()
              ).transacting(tx)
              allPromises.push knex("user_charges").insert(
                charge_id:id,
                user_id:userId,
                created_at:moment(item["ORDERTIME"]).utc().toDate()
                currency:'usd'
                charge_json:item
                amount:price
              ).transacting(tx)
              return Promise.all(allPromises)

    .then ()->

      console.log "ALL DONE".green
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->

      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'paypal:summary'
  .description '7 day summary of paypal volume'
  .action (args,callback)->

    PaypalExpress = require('paypal-express')

    if not config.get("paypalNvpApi.username")
      return callback(new Error("No Paypal NVP API Credentials set"))

    request = new PaypalExpress.NVPRequest(config.get("paypalNvpApi.username"),config.get("paypalNvpApi.password"),config.get("paypalNvpApi.signature"))
    Promise.promisifyAll(request)

    days = [0...7]

    bar = new ProgressBar('downloading data [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: days.length
    })

    Promise.map(days, (d)->

      allRequests = []
      day = moment().utc().subtract(d,'day').startOf('day')
      for i in [0...4]
        start = moment.utc(day).add(i*6,'hours')
        end = moment.utc(day).add((i+1)*6,'hours')
        # console.log "#{start.format()} .. #{end.format()}"
        allRequests.push request.makeRequestAsync(
          'METHOD': 'TransactionSearch',
          "STARTDATE": start.format()
          "ENDDATE": end.format()
        )

      return Promise.all(allRequests).then (responses)->

        items = []
        for data in responses
          responseItems = PaypalTools.paypalNvpSearchResponseToObjects(data)
          items = items.concat(responseItems)

        # update progress bar
        bar.tick()

        # return transaction rows
        return items

    ).then (results)->

      items = []
      for result in results
        row = _.reduce(result, (memo,object)->
          if parseFloat(object.amount) > 0
            memo.date ?= moment.utc(object.date).startOf('day').format("DD/MM")
            memo.amount ?= 0
            memo.amount = parseFloat(memo.amount) + parseFloat(object.amount)
            memo.amount = memo.amount.toFixed(2)
            memo.count ?= 0
            memo.count += 1
          return memo
        ,{})
        items.push(row)

      max = _.reduce(items, (memo,item)->
        if parseFloat(item.amount) > memo
          return item.amount
        else
          return memo
      ,0)


      _.each(items, (item)->
        percent = Math.round(20*item.amount/max)
        item.bar = ""
        if percent > 0
          _.times(percent, ()-> item.bar += "=")
      )

      maxAmountItem = _.max(items, (item)-> return parseFloat(item.amount))
      maxAmountItem.amount = maxAmountItem.amount.green

      logAsTable(items)
      callback()
      # process.exit(0)

    .catch DidNotConfirmError, (e)->

      console.log(e.message)
      callback(e)
      # process.exit(1)

    .catch (e)->

      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)
###
#program
#  .command 'announcements:add'
#  .description 'Add an in-game announcement'
#  .action (args,callback)->
#
#    return Promise.resolve()
#    .bind {}
#    .then ()->
#
#      @.newsItem =
#        title: "Unearthed Prophecy Expansion" # "News Title #{moment().format("HH:mm:ss")}"
#        type: "announcement"
#        content: fs.readFileSync(__dirname + '/data/news-content.md').toString()
#        created_at: moment().valueOf()
#
#      return confirmAsync("Adding #{@.newsItem.title}")
#
#    .then ()-> DuelystFirebase.connect().getRootRef()
#    .then (fbRootRef)->
#
#      newsItem = @.newsItem
#
#      console.log "adding news item: "
#      console.log prettyjson.render(newsItem)
#
#      item = fbRootRef.child("news").child("index").push()
#      created_at = moment().valueOf()
#
#      return Promise.all([
#        FirebasePromises.setWithPriority(item,{
#          title:newsItem.title
#          type:newsItem.type
#          created_at:newsItem.created_at
#        },newsItem.created_at),
#        FirebasePromises.setWithPriority(fbRootRef.child("news").child("content").child(item.key()),{
#          title:newsItem.title
#          content:newsItem.content
#          created_at:newsItem.created_at
#        },newsItem.created_at)
#      ])
#
#    .then ()->
#
#      console.log "DONE".green
#      callback()
#      # process.exit(0)
#
#    .catch DidNotConfirmError, (e)->
#
#      console.log(e.message)
#      callback(e)
#      # process.exit(1)
#
#    .catch (e)->
#
#      console.log prettyError.render(e)
#      callback(e)
#      # process.exit(1)

program
.command 'announcements:create_announcement'
.option('-E, --editor', 'opens dev editor')
.description 'Add an in-game announcement to current environment - will not work on production'
.action (args,callback)->
  if not (config.isDevelopment() or config.isStaging()) # everything but production is allowed
    callback("Cannot create announcement directly to production.\nPlease create for staging then migrate to Production")
    return

  return Promise.resolve()
  .bind {}
  .then ()->
    return inquirerPromisifed.prompt([{
      name:'title'
      message:"Enter Title of announcement:"
    }])
  .then (announcementTitleInput)->
    @.announcementTitle = announcementTitleInput.title
    @.announcementContent = ""

    console.log("Enter each line of markdown for the content of the announcement:")
    gatherLines = (lineCount) =>
      return inquirerPromisifed.prompt([{
        name:'lineContent'
        message:"Enter Line #{lineCount+1} of announcement:"
      }])
      .bind @
      .then (announcementContentInput)->
        @.announcementContent += announcementContentInput.lineContent + "  \n"
        console.log("Content so far:\n" + "#{@.announcementContent}".green)
        return promptWithList("Add more lines?",["Y","N"])
      .then (result)->
        if result == "Y"
          return gatherLines(lineCount+1)
        else
          return Promise.resolve()

    if args.options.editor
      return inquirerPromisifed.prompt([{
        type:'editor'
        name:'lineContent'
        message:"Enter content of announcement:"
      }]).bind(@)
      .then (editorInput)->
        @.announcementContent = editorInput.lineContent
        return Promise.resolve()
    else
      return gatherLines(0)
  .then ()->

    @.newsItem =
      title: @.announcementTitle
      type: "announcement"
      content: @.announcementContent
      created_at: moment().valueOf()

    return confirmAsync("Adding \"#{@.newsItem.title}\" announcement with content:\n" + "#{@.announcementContent}\n".green)

  .then ()-> DuelystFirebase.connect().getRootRef()
  .then (fbRootRef)->

    newsItem = @.newsItem

    console.log prettyjson.render(newsItem)

    item = fbRootRef.child("news").child("index").push()
    created_at = moment().valueOf()

    return Promise.all([
      FirebasePromises.setWithPriority(item,{
        title:newsItem.title
        type:newsItem.type
        created_at:newsItem.created_at
      },newsItem.created_at),
      FirebasePromises.setWithPriority(fbRootRef.child("news").child("content").child(item.key()),{
        title:newsItem.title
        content:newsItem.content
        created_at:newsItem.created_at
      },newsItem.created_at)
    ])

  .then ()->

    console.log "DONE".green
    callback()
  # process.exit(0)

  .catch DidNotConfirmError, (e)->

    console.log(e.message)
    callback(e)
  # process.exit(1)

  .catch (e)->

    console.log prettyError.render(e)
    callback(e)

program
.command 'announcements:remove_announcement'
.description 'Remove an in-game announcement from the environment'
.action (args,callback)->

  return Promise.resolve()
  .bind {}
  .then ()->
    @.numRemovalChoices = 5
    DuelystFirebase.connect().getRootRef()
  .then (fbRootRef)->
    @.fbRootRef = fbRootRef
    return FirebasePromises.once(@.fbRootRef.child("news").child("index").orderByChild('created_at').limitToLast(@.numRemovalChoices),"value")
  .then (newsIndicesSnapshots)->
    @.newsIndicesData = newsIndicesSnapshots.val()
    @.announcementsList = _.map(@.newsIndicesData, (val,key) -> val.key = key; return val)
    @.announcementsList = _.sortBy(@.announcementsList, (newsIndexData)-> return -1*newsIndexData.created_at)

#    announcementsOptionsStr = _.reduce(@.announcementsList,(memo,newsIndexData,index) ->
#
#      return "#{memo}\n#{index}: \"#{newsIndexData.title}\" #{moment(newsIndexData.created_at).toString()}"
#    ,"")
#
#    return inquirerPromisifed.prompt([{
#      name:'index'
#      message:"Choose by index which news item to remove:#{announcementsOptionsStr}\nEnter Index: "
#    }])
#  .then (announcementIndexInput)->
#    @.removalChoice = announcementIndexInput.index
    return promptWithList("Choose which news item to remove:",_.map(@.announcementsList,(item)->return item.title))
  .then (titleSelected)->

#    @.removalChoice = _.findIndex(@.announcementsList,(item)->return title == titleSelected)
    @.removalChoice = @.announcementsList.findIndex((item)->return item.title == titleSelected)


    @.removalKey = @.announcementsList[@.removalChoice].key
    if not _.isFinite(@.removalChoice) or @.removalChoice < 0 or @.removalChoice >= @.numRemovalChoices
      throw new error("Removal choice expects an number, invalid choice: #{@.removalChoice}")

    return FirebasePromises.once(@.fbRootRef.child("news").child("content").child(@.removalKey),"value")
  .then (announcementContentSnapshot) ->
    @.announcementContentData = announcementContentSnapshot.val()

    return confirmAsync("Confirm removal of news item with\n" +
             "Title: \"#{@.announcementContentData.title}\"\n" +
            "Content: #{@.announcementContentData.content}\n")
  .then ()->
    return Promise.all([
      FirebasePromises.remove(@.fbRootRef.child("news").child("content").child(@.removalKey))
      FirebasePromises.remove(@.fbRootRef.child("news").child("index").child(@.removalKey))
    ])
  .then ()->
    console.log "DONE".green
    callback()
  # process.exit(0)

  .catch DidNotConfirmError, (e)->

    console.log(e.message)
    callback(e)
  # process.exit(1)

  .catch (e)->

    console.log prettyError.render(e)
    callback(e)

"""
program
.command 'announcements:migrate_announcement'
.description 'Migrates an in-game announcement to the current environment from the staging environment'
.action (args,callback)->

  if config.isStaging()
    callback("Cannot migrate announcement from Staging to Staging")
    return

  return Promise.resolve()
  .bind {}
  .then ()->
    @.numChoices = 5
    stagingConfigFileContents = fs.readFileSync(__dirname + "/../config/staging.json").toString()
    stagingFileData = JSON.parse(stagingConfigFileContents)
    stagingURL = stagingFileData.firebase
    stagingToken = stagingFileData.firebaseToken
    return Promise.all([
      DuelystFirebase.connect().getRootRef(),
      DuelystFirebase.connect(stagingURL,stagingToken).getRootRef()
    ])
  .spread (fbRootRef,stagingFbRootRef)->
    @.fbRootRef = fbRootRef
    @.stagingFbRootRef = stagingFbRootRef
    return FirebasePromises.once(@.stagingFbRootRef.child("news").child("index").orderByChild('created_at').limitToLast(@.numChoices),"value")
  .then (newsIndicesSnapshots)->
    @.newsIndicesData = newsIndicesSnapshots.val()
    @.announcementsList = _.map(@.newsIndicesData, (val,key) -> val.key = key; return val)
    @.announcementsList = _.sortBy(@.announcementsList, (newsIndexData)-> return -1*newsIndexData.created_at)

#    announcementsOptionsStr = _.reduce(@.announcementsList,(memo,newsIndexData,index) ->
#
##      return "#{memo}\n#{index}: \"#{newsIndexData.title}\""
#    ,"")
#
#    return inquirerPromisifed.prompt([{
#      name:'index'
#      message:"Choose by index which news item to migrate:#{announcementsOptionsStr}\nEnter Index(0-#{@.numChoices}): "
#    }])
#  .then (announcementIndexInput)->

    return promptWithList("Choose which news item to migrate:",_.map(@.announcementsList,(item)->return item.title))
  .then (titleSelected)->

#    @.indexChoice = _.findIndex(@.announcementsList,(item)->return title == titleSelected)
    @.indexChoice = @.announcementsList.findIndex((item)->return item.title == titleSelected)
    @.migrationKey = @.announcementsList[@.indexChoice].key
    if not _.isFinite(@.indexChoice) or @.indexChoice < 0 or @.indexChoice >= @.numChoices
      throw new error("Removal choice expects an number, invalid choice: #{@.indexChoice}")

    return FirebasePromises.once(@.stagingFbRootRef.child("news").child("content").child(@.migrationKey),"value")
  .then (announcementContentSnapshot) ->
    @.announcementContentData = announcementContentSnapshot.val()

    return confirmAsync("Confirm migration of news item with\n" +
      "Title: \"#{@.announcementContentData.title}\"\n" +
      "Content: #{@.announcementContentData.content}\n" +
      "To the #{config.get('env')} environment... ")
  .then ()->
    announcementCreatedAt = moment().valueOf()
    return Promise.all([
      FirebasePromises.setWithPriority(@.fbRootRef.child("news").child("index").child(@.migrationKey),{
        title:       @.announcementContentData.title
        type:       "announcement"
        created_at:  announcementCreatedAt
      },announcementCreatedAt),
      FirebasePromises.setWithPriority(@.fbRootRef.child("news").child("content").child(@.migrationKey),{
        title:       @.announcementContentData.title
        content:     @.announcementContentData.content
        created_at: announcementCreatedAt
      },announcementCreatedAt)
    ])
  .then ()->
    console.log "DONE".green
    callback()
  # process.exit(0)

  .catch DidNotConfirmError, (e)->
    console.log "Did not confirm".red
#    console.log(e.message)
    callback(e)
  # process.exit(1)

  .catch (e)->

    console.log prettyError.render(e)
    callback(e)
"""

program
  .command 'users:gift_crates <username_or_email>'
  .description 'get gift crate inventory for a user based on username or email'
  .action (args,callback)->

    username_or_email = args.username_or_email
    fieldName = 'username'
    if username_or_email.indexOf('@') > 0
      fieldName = 'email'
    if username_or_email.indexOf("id:") == 0
      fieldName = 'id'
      username_or_email = username_or_email.replace("id:","")

    if fieldName == 'email' or fieldName == 'username'
      username_or_email = username_or_email.toLowerCase()

    knex("users").where(fieldName,username_or_email).first('id','username','email').then (userRow)->

      if not userRow?
        throw new Error("Could not find user")

      console.log prettyjson.render({
        id:userRow.id
        username:userRow.username
        email:userRow.email
      })

      whereClause = { 'user_id': userRow.id }

      return Promise.all([
        knex("user_gift_crates").where(whereClause).orderByRaw('created_at desc')
        knex("user_gift_crates_opened").where(whereClause).orderByRaw('created_at desc')
      ])

    .spread (createRows,openedCreateRows)->

      _.each createRows, (c)->
        c.crate_type = c.crate_type.yellow
        delete c.user_id

      _.each openedCreateRows, (c)->
        c.crate_type = c.crate_type.yellow
        delete c.user_id

      console.log("crates:")
      logAsTable(createRows)

      console.log("opened crates:")
      logAsTable(openedCreateRows)

      callback()
      # process.exit(0)

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)
      # process.exit(1)

program
  .command 'users:add_gift_crates <username_or_email> <crate_type>'
  .description 'give comma seperated list of user(s) a gift crate of crate_type'
  .action (args,callback)->

    username_or_emails = args.username_or_email
    username_or_email = username_or_email.toLowerCase()
    crate_type = args.crate_type
    fieldName = 'username'


    return Promise.map username_or_emails?.split(','), (username_or_email)->
      return Promise.resolve()
      .then ()->

        GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
        if not GiftCrateLookup[crate_type]?
          throw new Error("unknown crate type: #{crate_type}")

        if username_or_email.indexOf('@') > 0
          fieldName = 'email'
        if username_or_email.indexOf("id:") == 0
          fieldName = 'id'
          username_or_email = username_or_email.replace("id:","")

        return knex("users").where(fieldName,username_or_email).first('id','username','email')

      .then (userRow)->

        if not userRow?
          throw new Error("Could not find user")

        @.userRow = userRow

        console.log prettyjson.render({
          id:userRow.id
          username:userRow.username
          email:userRow.email
        })

        whereClause = { 'user_id': userRow.id, 'crate_type':crate_type  }

        return Promise.all([
          knex("user_gift_crates").where(whereClause).orderByRaw('created_at desc')
          knex("user_gift_crates_opened").where(whereClause).orderByRaw('created_at desc')
        ])

      .spread (crateRows,openedCrateRows)->

        if crateRows.length > 0 or openedCrateRows.length > 0
          throw new Errors.AlreadyExistsError("User already has this crate")

        GiftCrateModule ?= require 'server/lib/data_access/gift_crate'
        trxPromise = knex.transaction (trx)->

          GiftCrateModule.addGiftCrateToUser(trxPromise, trx, @.userRow.id, crate_type, "CRM")
          .then trx.commit
          .catch trx.rollback
          return

        return trxPromise

    .then ()->
      callback()
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)

##

program
.command 'users:purchase_set_with_spirit <username> <card_set_id>'
.description 'give comma seperated list of user(s) a gift crate of crate_type'
.action (args,callback)->

  InventoryModule ?= require 'server/lib/data_access/inventory'
  UsersModule ?= require 'server/lib/data_access/users'

  username = args.username
  username = username.toLowerCase()
  card_set_id = parseInt(args.card_set_id)

  return UsersModule.userIdForUsername(username)
  .then (userId)->
    return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId,card_set_id)
  .then ()->
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)

##
###
program
  .command 'users:fix_crate <crate_type>'
  .description '...'
  .action (args,callback)->

    crate_type = args.crate_type

    knex.raw("SELECT id,username,email FROM users WHERE NOT EXISTS (SELECT user_id FROM user_gift_crates WHERE crate_type = ? and user_id = users.id UNION SELECT user_id FROM user_gift_crates_opened WHERE crate_type = ? and user_id = users.id)",[crate_type,crate_type])
    .then (result)->

      rows = @.rows = result.rows

      GiftCrateLookup = require 'app/sdk/giftCrates/giftCrateLookup'
      if not GiftCrateLookup[crate_type]?
        throw new Error("unknown crate type: #{crate_type}")

      GiftCrateModule ?= require 'server/lib/data_access/gift_crate'

      console.log "found #{rows.length} users"

      return confirmAsync("Are you sure you want to give #{rows.length} users #{crate_type.yellow} crate?")

    .then ()->

      bar = new ProgressBar('processing [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: rows.length
      })

      return Promise.map(@.rows, (userRow)->
        return Promise.resolve()
        .then ()->
          trxPromise = knex.transaction (trx)->
            GiftCrateModule.addGiftCrateToUser(trxPromise, trx, userRow.id, crate_type, "CRM")
            .then trx.commit
            .catch trx.rollback
            return
          return trxPromise
        .then ()->
          bar.tick()
      ,5)
    .then ()->
      console.log("the following users received crate #{crate_type}:")
      logAsTable(@.rows)

      if not mailer?
        mailer ?= require 'server/mailer'
        Promise.promisifyAll(mailer)

      output = handlebars.compile("{{#each rows}}<pre>{{id}}  {{username}}      {{email}}</pre>{{/each}}")({rows:@.rows})

      mailer.sendCRMActivityReportAsync("gift crate fix","the following users received crate #{crate_type}: #{output}")
      callback()
    .catch (e)->
      console.log prettyError.render(e)
      callback(e)

program
  .command 'hash_password <password>'
  .description 'output a hashed password'
  .action (args,callback)->

    password = args.password
    return hashHelpers.generateHash(password)
    .then (hashedPass)->
      console.log(hashedPass)
      callback()
    .catch (e)->
      console.log prettyError.render(e)
###
program
.command 'tippers:top [YYYYMM]'
.description 'Outputs top srank players for a season to sRankSnapshots directory'
.action (args,callback)->
  startOfSeasonMoment = null;
  endOfSeasonMoment = null;

  minGames = 0
  if args.minGames?
    minGames = parseInt(args.minGames)

  numPlayers = 100
  if args.numPlayers?
    numPlayers = parseInt(args.numPlayers)


  # generate start season moment
  if not args.YYYYMM?
    # Defaults to last month
    console.log()
    startOfSeasonMoment = moment.utc().subtract(1,"month").startOf("month")
  else
    yearMonthStr = "" + args.YYYYMM
    if yearMonthStr.length != 6
      return callback(new Error("Invalid season input"))
    startOfSeasonMoment = moment.utc(yearMonthStr,"YYYYMM")

  # generate end season moment (always 1 month later)
  endOfSeasonMoment = startOfSeasonMoment.clone().endOf("month")

  # Generate date strings for query
  startOfSeasonStr = startOfSeasonMoment.format("YYYY-MM-DD")
  endOfSeasonStr = endOfSeasonMoment.format("YYYY-MM-DD")

  topTippersPromise = knex.raw("""
                              SELECT username,user_id,SUM(gold_tip_amount) as total_tips FROM user_games
                              LEFT JOIN users ON users.id = user_games.user_id
                              WHERE user_games.created_at > ? and user_games.created_at < ?
                                 and gold_tip_amount > 0
                              GROUP BY user_id, username
                              ORDER BY total_tips DESC
                              LIMIT 50;
                              """,[startOfSeasonStr,endOfSeasonStr])

  return topTippersPromise
  .bind {}
  .then (topTipperData) ->
    if not topTipperData? or not topTipperData.rows?
      return Promise.reject("No Database data")

    outputDir = "./tippersSnapshots/"
    snapshotFileName = ""
    snapshotFileName += "top_tippers_" + startOfSeasonMoment.format("YYYYMM")
    snapshotFileName += ".csv"
    @.outputFileLocation = outputDir + snapshotFileName
    headerColumns = "Username, User ID, Total Tips\n"
    outputText = _.reduce(topTipperData.rows,(memo,tipperRow)->
      return memo + "#{tipperRow.user_id},#{tipperRow.username},#{tipperRow.total_tips}\n"
    ,headerColumns)
    return console.log(outputText)
  .then ()->
    console.log("DONE".green)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)



program
.command 'srank:top [YYYYMM] [numPlayers] [minGames]'
.option('-d, --detailed', 'Fetch additional details about players')
.description 'Outputs top srank players for a season to sRankSnapshots directory'
.action (args,callback)->
  yearMonthStr = null
  startOfSeasonMoment = null;
  endOfSeasonMoment = null;

  minGames = 0
  if args.minGames?
    minGames = parseInt(args.minGames)

  numPlayers = 100
  if args.numPlayers?
    numPlayers = parseInt(args.numPlayers)


  if not args.YYYYMM?
    # Defaults to last month
    startOfSeasonMoment = moment.utc().subtract(1,"month").startOf("month")
  else
    yearMonthStr = "" + args.YYYYMM
    if yearMonthStr.length != 6
      console.log("here yms: #{yearMonthStr}")
      console.log("here ymsl: #{yearMonthStr.length}")
      return callback(new Error("Invalid season input"))

    startOfSeasonMoment = moment.utc(yearMonthStr,"YYYYMM")

  endOfSeasonMoment = startOfSeasonMoment.clone().endOf("month")

  startSeasonVal = startOfSeasonMoment.toDate()
  endSeasonVal = endOfSeasonMoment.toDate()

  passingPlayersPromise = null

  passingPlayersPromise = knex("user_rank_ratings").select("user_id","rating","ladder_rating","srank_game_count","srank_win_count","top_rating").where("season_starting_at",startSeasonVal).andWhere('srank_game_count', '>', minGames).orderBy("ladder_rating","desc")
  .bind({})
  .then (userRankRatingRows)->
    @.userRankRatingRows = userRankRatingRows
    if not @.userRankRatingRows?
      throw new Error("Could not find user rank ratings")

    @.currentIndex = 0
    @.passingPlayers = []
    passingPlayersFilter = () =>
      if @.currentIndex == @.userRankRatingRows.length
        return Promise.resolve(@.passingPlayers)
      else if @.passingPlayers.length == numPlayers
        return Promise.resolve(@.passingPlayers)
      else
        currentRatingRow = @.userRankRatingRows[@.currentIndex]
        return Promise.all([
#          knex("user_games").count().whereBetween("created_at",[startSeasonVal,endSeasonVal]).andWhere("user_id",currentRatingRow.user_id).andWhere("rank_before",0).andWhere("game_type","ranked"),
          knex("user_games").first("created_at").orderBy("created_at","asc").whereBetween("created_at",[startSeasonVal,endSeasonVal]).andWhere("user_id",currentRatingRow.user_id).andWhere("rank_before",0).andWhere("game_type","ranked")
        ]).bind(@)
        .spread (firstSRankGameRow) ->
          playersNumSRankGames = currentRatingRow.srank_game_count
          playerIsSRank = (playersNumSRankGames > 0)

          firstSRankTime = null
          if firstSRankGameRow? and firstSRankGameRow.created_at
            firstSRankTime = moment.utc(firstSRankGameRow.created_at).toString()

          if playersNumSRankGames >= minGames and playerIsSRank # This is redundant
            @.passingPlayers.push({
              user_id:currentRatingRow.user_id,
              rank:(@.passingPlayers.length+1),
              num_srank_matches: playersNumSRankGames
              rating: currentRatingRow.rating
              ladder_rating: currentRatingRow.ladder_rating
              top_rating: currentRatingRow.top_rating
              row_srank_matches: currentRatingRow.srank_game_count
              row_srank_wins: currentRatingRow.srank_win_count
              first_srank_time: firstSRankTime
            })

          @.currentIndex++
          return passingPlayersFilter()
    return passingPlayersFilter()

  passingPlayersPromise
  .bind({})
  .then (passingPlayers)->
    @.passingPlayers = passingPlayers
    return Promise.map(@.passingPlayers, (player) =>
      return knex("users").first("username","email").where("id",player.user_id)
      .then (userRow) ->
        player.email = userRow.email
        player.username = userRow.username
        return Promise.resolve(player)
    )

  .then (passingPlayers)->
    outputDir = "./srankSnapshots/" + startOfSeasonMoment.format("YYYYMM") + "/"
    snapshotFileName = ""
    snapshotFileName += "top" + numPlayers
    snapshotFileName += "min" + minGames
    if args.options.detailed
      snapshotFileName += "-detailed"
    snapshotFileName += "-"
    snapshotFileName += (moment().utc().format('YYYYMMDDHHMMSS'))
    snapshotFileName += ".csv"
    @.outputFileLocation = outputDir + snapshotFileName
    if args.options.detailed
      headerColumns = "Ladder Position, Ladder Rating, Top Rating, User ID, Username, E-Mail, Num S-Rank Matches, Num S-Rank Row Matches, Raw Rating, Num S-Rank Row Wins, First S-Rank Match\n"
    else
      headerColumns = "Ladder Position, Ladder Rating, Top Rating, User ID, Username, E-Mail, Num S-Rank Matches\n"
    outputText = _.reduce(passingPlayers,(memo,player)->
      if args.options.detailed
        return memo + "#{player.rank},#{player.ladder_rating},#{player.top_rating},#{player.user_id},#{player.username},#{player.email},#{player.num_srank_matches},#{player.row_srank_matches},#{player.rating},#{player.row_srank_wins},#{player.first_srank_time}\n"
      else
        return memo + "#{player.rank},#{player.ladder_rating},#{player.top_rating},#{player.user_id},#{player.username},#{player.email},#{player.num_srank_matches}\n"
    ,headerColumns)
    return console.log(outputText)
  .then ()->
    console.log("DONE".green)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)


###

#-----

program
.command 'rift:top [YYYYMM] [numPlayers] [minGames]'
.option('-d, --detailed', 'Fetch additional details about players')
.description 'Outputs top rift players for a season to riftSnapshots directory'
.action (args,callback)->
  # much of the functionality here is not needed and currently ignored (but left for later use)
  console.log("Beginning top rift processing")

#  yearMonthStr = null
#  startOfSeasonMoment = null;
#  endOfSeasonMoment = null;
#
#  minGames = 0
#  if args.minGames?
#    minGames = parseInt(args.minGames)
#
  numPlayers = 50
  if args.numPlayers?
    numPlayers = parseInt(args.numPlayers)
#
#
#  if not args.YYYYMM?
#    # Defaults to last month
#    startOfSeasonMoment = moment.utc().subtract(1,"month").startOf("month")
#  else
#    yearMonthStr = "" + args.YYYYMM
#    if yearMonthStr.length != 6
#      console.log("here yms: #{yearMonthStr}")
#      console.log("here ymsl: #{yearMonthStr.length}")
#      return callback(new Error("Invalid season input"))
#
#    startOfSeasonMoment = moment.utc(yearMonthStr,"YYYYMM")
#
#  endOfSeasonMoment = startOfSeasonMoment.clone().endOf("month")
#
#  startSeasonVal = startOfSeasonMoment.toDate()
#  endSeasonVal = endOfSeasonMoment.toDate()

  passingPlayersPromise = null

  this_obj = {}

  passingPlayersPromise = knex("user_rift_runs").select("user_id","win_count","rift_rating","faction_id","general_id").where("win_count",">",5).orderBy("rift_rating","desc").limit(200)
  .bind(this_obj)
  .then (userRiftRatingRows)->
    console.log("Rift run rows retrieved.")
    @.userRiftRatingRows = userRiftRatingRows
    if not @.userRiftRatingRows?
      throw new Error("Could not find user rift ratings")

    @.currentIndex = 0
    @.passingPlayerIds = []
    @.passingPlayerDataById = {}
#    @.passingPlayers = []
    passingPlayersFilter = () =>
      if @.currentIndex == @.userRiftRatingRows.length
        return Promise.resolve(@.passingPlayerIds)
      else if @.passingPlayerIds.length == numPlayers
        return Promise.resolve(@.passingPlayerIds)
      else
        currentRatingRow = @.userRiftRatingRows[@.currentIndex]
        if (_.indexOf(@.passingPlayerIds,currentRatingRow.user_id) == -1)
          @.passingPlayerIds.push(currentRatingRow.user_id)
          @.passingPlayerDataById[currentRatingRow.user_id] = currentRatingRow
          @.passingPlayerDataById[currentRatingRow.user_id].rank = @.passingPlayerIds.length

          if @.passingPlayerIds.length % 10 == 0
            console.log("#{@.passingPlayerIds.length} Top players processed")

        @.currentIndex++
        return passingPlayersFilter()

#        return Promise.all([
##          knex("user_games").count().whereBetween("created_at",[startSeasonVal,endSeasonVal]).andWhere("user_id",currentRatingRow.user_id).andWhere("rank_before",0).andWhere("game_type","ranked"),
#          knex("user_games").first("created_at").orderBy("created_at","asc").whereBetween("created_at",[startSeasonVal,endSeasonVal]).andWhere("user_id",currentRatingRow.user_id).andWhere("rank_before",0).andWhere("game_type","ranked")
#        ]).bind(@)
#        .spread (firstSRankGameRow) ->
#          playersNumSRankGames = currentRatingRow.srank_game_count
#          playerIsSRank = (playersNumSRankGames > 0)
#
#          firstSRankTime = null
#          if firstSRankGameRow? and firstSRankGameRow.created_at
#            firstSRankTime = moment.utc(firstSRankGameRow.created_at).toString()
#
#          if playersNumSRankGames >= minGames and playerIsSRank # This is redundant
#            @.passingPlayers.push({
#              user_id:currentRatingRow.user_id,
#              rank:(@.passingPlayers.length+1),
#              num_srank_matches: playersNumSRankGames
#              rating: currentRatingRow.rating
#              ladder_rating: currentRatingRow.ladder_rating
#              row_srank_matches: currentRatingRow.srank_game_count
#              row_srank_wins: currentRatingRow.srank_win_count
#              first_srank_time: firstSRankTime
#            })
#
#          @.currentIndex++
#          return passingPlayersFilter()
    return passingPlayersFilter()

  passingPlayersPromise
  .bind(this_obj)
  .then (passingPlayerIds)->
#    @.passingPlayerIds = passingPlayerIds
    return Promise.map(@.passingPlayerIds, (playerId) =>
      return knex("users").first("username","email").where("id",playerId)
      .then (userRow) =>
        @.passingPlayerDataById[playerId].email = userRow.email
        @.passingPlayerDataById[playerId].username = userRow.username
        return Promise.resolve(@.passingPlayerDataById[playerId])
    )

  .then (passingPlayers)->
    outputDir = "./riftSnapshots/" + "/"
    snapshotFileName = ""
    snapshotFileName += "top" + numPlayers
#    snapshotFileName += "min" + minGames
#    if args.options.detailed
#      snapshotFileName += "-detailed"
    snapshotFileName += "-"
    snapshotFileName += (moment().utc().format('YYYYMMDDHHMMSS'))
    snapshotFileName += ".csv"
    @.outputFileLocation = outputDir + snapshotFileName
    headerColumns = "Rift Ladder Position, Rift Rating, User ID, Username, E-Mail\n"
    outputText = _.reduce(@.passingPlayerIds,(memo,playerId)=>
      playerData = @.passingPlayerDataById[playerId]
      return memo + "#{playerData.rank},#{playerData.rift_rating},#{playerData.user_id},#{playerData.username},#{playerData.email}\n"
    ,headerColumns)
    return helpers.writeFile(@.outputFileLocation,outputText)
  .then ()->
    console.log("DONE: Rift Snapshot written to #{@.outputFileLocation}".green)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)

#-----



program
.command 'info:division_breakdown [YYYYMM]'
.description 'Outputs breakdown of number of users per division (defaults to last season)'
.action (args,callback)->
  yearMonthStr = null
  startOfSeasonMoment = null;


  if not args.YYYYMM?
    # Defaults to last month
    startOfSeasonMoment = moment.utc().subtract(1,"month").startOf("month")
    yearMonthStr = startOfSeasonMoment.format("YYYYMM")
  else
    yearMonthStr = "" + args.YYYYMM
    if yearMonthStr.length != 6
      return callback(new Error("Invalid season input"))

    startOfSeasonMoment = moment.utc(yearMonthStr,"YYYYMM")

  startSeasonVal = startOfSeasonMoment.toDate()

  passingPlayersPromise = null

  Promise.all([
    knex("users").select("rank").where("rank_starting_at",startSeasonVal).count().groupBy("rank"),
    knex("user_rank_history").select("rank").where("starting_at",startSeasonVal).count().groupBy("rank")
  ]).spread (usersCounts,rankHistoryCounts)->
    countByRank = {}
    for countData in usersCounts
      if countData.rank?
        countByRank[countData.rank] ?= 0
        countByRank[countData.rank] += parseInt(countData.count)
    for countData in rankHistoryCounts
      if countData.rank?
        countByRank[countData.rank] ?= 0
        countByRank[countData.rank] += parseInt(countData.count)

    countByDivision = {}
    for rank,count of countByRank
      countByDivision[SDK.RankFactory.rankedDivisionNameForRank(rank)] ?= 0
      countByDivision[SDK.RankFactory.rankedDivisionNameForRank(rank)] += count

    outputStr = "Breakdown for #{yearMonthStr} by Rank:"
    for i in [0..30]
      if i < 10
        iStr = "0" + i
      else
        iStr = "" + i
      countForRank = countByRank[i] or 0
      outputStr += "\n #{iStr}: #{countForRank}"
    outputStr += "\nBreakdown by Division:"
    for division,countForDivision of countByDivision
      outputStr += "\n #{division}: #{countForDivision}"

    console.log("Done.\n" + outputStr)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)
###

program
.command 'gauntlet:top [YYYYMM] [minRuns]'
.description 'Outputs top gauntlet players for a season to gauntletSnapshots directory'
.action (args,callback)->
  startOfSeasonMoment = null;
  endOfSeasonMoment = null;

  minRuns = 20
  if args.minRuns?
    minRuns = parseInt(args.minRuns)


  # generate start season moment
  if not args.YYYYMM?
    # Defaults to last month
    startOfSeasonMoment = moment.utc().subtract(1,"month").startOf("month")
  else
    yearMonthStr = "" + args.YYYYMM
    if yearMonthStr.length != 6
      return callback(new Error("Invalid season input"))
    startOfSeasonMoment = moment.utc(yearMonthStr,"YYYYMM")

  # generate end season moment (always 1 month later)
  endOfSeasonMoment = startOfSeasonMoment.clone().endOf("month")

  # Generate date strings for query
  startOfSeasonStr = startOfSeasonMoment.format("YYYY-MM-DD")
  endOfSeasonStr = endOfSeasonMoment.format("YYYY-MM-DD")

  topGauntletPlayersPromise = knex.raw("""
    SELECT username,user_id, SUM(win_count)::float / (SUM(win_count)::float + SUM(loss_count)::float) as avg_win_ratio, count(*) as count_completed_runs, SUM(win_count) as total_wins, AVG(win_count) as avg_win_per_run, SUM(loss_count) as total_losses FROM user_gauntlet_run_complete
    LEFT JOIN users ON users.id = user_gauntlet_run_complete.user_id
    WHERE user_gauntlet_run_complete.ended_at > ? and user_gauntlet_run_complete.ended_at < ?
    GROUP BY user_id, username
    HAVING count(*) >= ?
      AND (SUM(win_count) + SUM(loss_count) > 0)
    ORDER BY avg_win_per_run DESC
    LIMIT 100;
    """,[startOfSeasonStr,endOfSeasonStr,minRuns])


  return topGauntletPlayersPromise
  .bind {}
  .then (topGauntletPlayersData) ->
    console.log(JSON.stringify(topGauntletPlayersData.rows,null,2))

    if not topGauntletPlayersData? or not topGauntletPlayersData.rows?
      return Promise.reject("No Database data")

    outputDir = "./gauntletSnapshots/"
    snapshotFileName = ""
    snapshotFileName += "top_gauntlet_" + startOfSeasonMoment.format("YYYYMM")
    snapshotFileName += "min_runs_" + minRuns
    snapshotFileName += ".csv"
    @.outputFileLocation = outputDir + snapshotFileName
    headerColumns = "Username, User ID, Win Rate per game, Total Wins, Total Losses, Total Runs, Average Wins Per Run\n"
    outputText = _.reduce(topGauntletPlayersData.rows,(memo,playerRow)->
      return memo + "#{playerRow.user_id},#{playerRow.username},#{playerRow.avg_win_ratio},#{playerRow.total_wins},#{playerRow.total_losses},#{playerRow.count_completed_runs},#{playerRow.avg_win_per_run}\n"
    ,headerColumns)
    return console.log(outputText)
  .then ()->
    console.log("DONE".green)
    callback()
  .catch (e)->
    console.log prettyError.render(e)
    callback(e)

program
  .command 'gift_codes:create <type> [count]'
  .option('-r, --restricted', 'Do the codes have a registration cutoff before which they don\'t work?')
  .description 'create a set of redeemable gift codes'
  .action (args,callback)->

    type = args.type
    count = args.count || 1

    if !type
      return callback(new Error("Must provide a type"))

    codes = []
    for i in [1..count]
      codes.push(uuid.v4())

    startingPromise = Promise.resolve(null)

    if type == "rewards"
      startingPromise = Promise.resolve(null)
      .bind {}
      .then ()->
        @.rewardsJson = {}
        inquirerPromisifed.prompt([{
          name:'gold'
          message:"Enter GOLD amount (RETURN for none):"
        }])
      .then (goldInput)->
        gold = parseInt(goldInput.gold)
        if gold
          @.rewardsJson.gold = gold

        return inquirerPromisifed.prompt([{
          name:'spirit'
          message:"Enter SPIRIT amount (RETURN for none):"
        }])
      .then (spiritInput)->
        spirit = parseInt(spiritInput.spirit)
        if spirit
          @.rewardsJson.spirit = spirit

        return inquirerPromisifed.prompt([{
          name:'orbs'
          message:"Enter CORE SET ORBS amount (RETURN for none):"
        }])
      .then (orbsInput)->
        orbs = parseInt(orbsInput.orbs)
        if orbs
          @.rewardsJson.orbs = orbs

        return inquirerPromisifed.prompt([{
          name:'shimzarOrbs'
          message:"Enter SHIMZAR SET ORBS amount (RETURN for none):"
        }])
      .then (shimzarOrbsInput)->
        shimzarOrbs = parseInt(shimzarOrbsInput.shimzarOrbs)
        if shimzarOrbs
          @.rewardsJson.shimzar_orbs = shimzarOrbs

        return inquirerPromisifed.prompt([{
          name:'comboOrbs'
          message:"Enter ANCIENT SET ORBS amount (RETURN for none):"
        }])
      .then (comboOrbsInput)->
        comboOrbs = parseInt(comboOrbsInput.comboOrbs)
        if comboOrbs
          @.rewardsJson.combo_orbs = comboOrbs

        return inquirerPromisifed.prompt([{
          name:'unearthedOrbs'
          message:"Enter UNEARTHED SET ORBS amount (RETURN for none):"
        }])
      .then (unearthedOrbsInput)->
        unearthedOrbs = parseInt(unearthedOrbsInput.unearthedOrbs)
        if unearthedOrbs
          @.rewardsJson.unearthed_orbs = unearthedOrbs

        return inquirerPromisifed.prompt([{
          name:'immortalOrbs'
          message:"Enter IMMORTAL SET ORBS amount (RETURN for none):"
        }])
      .then (immortalOrbsInput)->
        immortalOrbs = parseInt(immortalOrbsInput.immortalOrbs)
        if immortalOrbs
          @.rewardsJson.immortal_orbs = immortalOrbs

        return inquirerPromisifed.prompt([{
          name:'mythronOrbs'
          message:"Enter MYTHRON SET ORBS amount (RETURN for none):"
        }])
      .then (mythronOrbsInput)->
        mythronOrbs = parseInt(mythronOrbsInput.mythronOrbs)
        if mythronOrbs
          @.rewardsJson.mythron_orbs = mythronOrbs

        return inquirerPromisifed.prompt([{
          name:'gauntlet_tickets'
          message:"Enter GAUNTLET TICKETS amount (RETURN for none):"
        }])
      .then (input)->
        gauntlet_tickets = parseInt(input.gauntlet_tickets)
        if gauntlet_tickets
          @.rewardsJson.gauntlet_tickets = gauntlet_tickets

        return inquirerPromisifed.prompt([{
          name:'cosmetics'
          message:"Enter COSMETIC IDS to reward separated by commas if multiple (RETURN for none):"
        }])
      .then (input)->
        if input? && input.cosmetics
          cosmeticsStrings = input.cosmetics.split(",")
          if cosmeticsStrings.length != 0
            cosmeticIds = _.map(cosmeticsStrings,(cosmeticString) -> return parseInt(cosmeticString))
            # Validate card IDs
            validCosmeticIds = []
            for cosmeticId in cosmeticIds
              cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId)
              if not cosmeticData?
                console.warn("Error: Omitting cosmetic id '#{cosmeticId}' - not a valid cosmetic")
              else
                validCosmeticIds.push(cosmeticId)
            @.rewardsJson.cosmetics = validCosmeticIds

        return inquirerPromisifed.prompt([{
          name:'card_ids'
          message:"Enter CARD IDS to reward separated by commas if multiple (RETURN for none):"
        }])
      .then (input)->
        if input? && input.card_ids
          cardIdsStrings = input.card_ids.split(",")
          if cardIdsStrings.length != 0
            cardIds = _.map(cardIdsStrings,(cardIdStr) -> return parseInt(cardIdStr))
            # Validate card IDs
            validCardIds = []
            for cardId in cardIds
              sdkCard = SDK.CardFactory.cardForIdentifier(cardId)
              if not sdkCard?
                console.warn("Error: Omitting card id '#{cardId}' - not a valid card")
              else
                validCardIds.push(cardId)
            @.rewardsJson.card_ids = validCardIds

        cosmeticChestTypes = _.keys(SDK.CosmeticsChestTypeLookup)
        @.cosmeticChestListString = cosmeticChestTypes.join(",")

        return inquirerPromisifed.prompt([{
          name:'crates'
          message:"Enter CRATES to reward separated by commas if multiple (RETURN for none):\nCrate types: " + @.cosmeticChestListString
        }])
      .then (input)->
        if input? && input.crates
          rewardedCrateNames = input.crates.split(",")

          # Validate crate names and convert to types
          rewardedCrateTypes = []
          for crateName in rewardedCrateNames
            if not SDK.CosmeticsChestTypeLookup[crateName]
              throw new Error("Invalid cosmetic chest type entered: " + crateName)

            rewardedCrateTypes.push(SDK.CosmeticsChestTypeLookup[crateName])

          @.rewardsJson.crates = rewardedCrateTypes

        return inquirerPromisifed.prompt([{
          name:'crate_keys'
          message:"Enter CRATE KEYS to reward separated by commas if multiple (RETURN for none):\nKey types: " + @.cosmeticChestListString
        }])
      .then (input)->
        if input? && input.crate_keys
          rewardedCrateKeyNames = input.crate_keys.split(",")

          # Validate key names and convert to types
          rewardedCrateKeyTypes = []
          for keyName in rewardedCrateKeyNames
            if not SDK.CosmeticsChestTypeLookup[keyName]
              throw new Error("Invalid cosmetic chest type entered: " + keyName)

            rewardedCrateKeyTypes.push(SDK.CosmeticsChestTypeLookup[keyName])

          @.rewardsJson.crate_keys = rewardedCrateKeyTypes


        if (_.keys(@.rewardsJson).length == 0)
          throw new Error("Looks like you've added no rewards.")

        console.log "final rewards json: "
        console.log prettyjson.render(@.rewardsJson)

        return confirmAsync('Are you satisfied with the above rewards?')

      .then ()->

        return Promise.resolve(@.rewardsJson)

    return startingPromise
    .bind {}
    .then (rewardsJson)->
      @.rewardsJson = rewardsJson
      if args.options.restricted
        return inquirerPromisifed.prompt([{
          name:'cutoff'
          message:"Enter registration cutoff date (YYYY/MM/DD) ... users registering before this date will NOT be able to use the code (RETURN for none):"
          validate:(input)-> return validator.isDate(input) || input.length == 0
        }])
      else
        return Promise.resolve(null)
    .then (input)->
      @.cutoffDate = null
      if input?.cutoff.length > 0
        @.cutoffDate = moment.utc(input.cutoff).toDate()
        console.log "cutoff date set to: ",@.cutoffDate

      if args.options.restricted
        return inquirerPromisifed.prompt([{
          name:'expiresAfterDayCount'
          message:"How many days from today is the code valid for:"
          validate:(input)-> return validator.isNumeric(input) || input == null
        }])
      else
        return Promise.resolve(null)
    .then (input)->
      @.expiresAt = null
      if input?.expiresAfterDayCount
        @.expiresAt = moment.utc().add(input.expiresAfterDayCount,'days').toDate()
        console.log "expire date set to: ",@.expiresAt

      return knex("gift_codes").distinct("exclusion_id").select("exclusion_id")
    .then (existingExclusionIdRows) ->
      existingExclusionIds = _.map(existingExclusionIdRows, (row) -> return row.exclusion_id)
      existingExclusionIds = _.filter(existingExclusionIds, (exclusionId) -> return exclusionId != null)
      existingExclusionIds.sort()

      console.log("Current existing exclusion ids:")
      _.each(existingExclusionIds,(exclusionId) -> console.log(" - #{exclusionId}"))

      return inquirerPromisifed.prompt([{
        name:'exclusion_id'
        message:"Enter exclusion id (user can only redeem 1 code per id) (RETURN for none):"
      }])
    .then (exclusionIdInput) ->
      @.exclusionId = null
      if (exclusionIdInput.exclusion_id? and exclusionIdInput.exclusion_id.length)
        @.exclusionId = exclusionIdInput.exclusion_id

      console.log "Final Gift Code Params:"
      console.log prettyjson.render({
        type:type
        rewards:@.rewardsJson
        valid_for_users_created_after:@.cutoffDate
        expires_at:@.expiresAt
        exclusion_id:@.exclusionId
      })

      return Promise.map(codes, (code)=>
        return knex("gift_codes").insert({
          code:code
          type:type
          rewards:@.rewardsJson
          valid_for_users_created_after:@.cutoffDate
          expires_at:@.expiresAt
          exclusion_id:@.exclusionId
        })
      )
    .then ()->
      console.log(codes)
    .catch DidNotConfirmError, (e)->
      console.log "aborting..."
      callback()
###
program
  .command 'gift_codes:create_for_humble [count]'
  .description 'create gift codes for Humble Promotion 2016-09-20'
  .action (args,callback)->

    count = args.count || 1

    codesOrbs = []
    for i in [1..count]
      codesOrbs.push(uuid.v4())

    startingPromise = Promise.resolve(null)

    bar = new ProgressBar('processing [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: count
    })

    codesOrbsString = _.reduce codesOrbs, ((memo, code)-> return memo + "#{code}\r\n"), ""
    fs.writeFileAsync("#{__dirname}/humble_orb_codes_CODES.txt", codesOrbsString)

    #cosmeticCodeRows = _.map codesCosmetics, (code)->
    #  return {
    #      code:code
    #      type:"rewards"
    #      rewards:{
    #      cosmetics:[1000014,10007,2118,2121,2124]
    #      card_ids:[11018]
    #      orbs: 1
    #      crate_keys:["bronze"]
    #    }
    #    valid_for_users_created_after:null,
    #    expires_at:moment.utc("2016-11-18").toDate()
    #    exclusion_id:"humble_cosmetics_20160920"
    #  }

    orbCodeRows = _.map codesOrbs, (code)->
      return {
        code:code
        type:"rewards"
        rewards:{
          crate_keys:["bronze"]
        }
        exclusion_id:"social_youtube_2016"
      }

    toEscapedJsonString = (obj) -> "'#{JSON.stringify(obj).replace(/\"/g,'"')}'"
    codesOrbsCSV = _.reduce(orbCodeRows, (memo, row)->
      return memo + "#{row.code},#{row.type},#{toEscapedJsonString(row.rewards)},#{moment.utc("2016-09-15").format()},#{moment.utc("2016-11-18").format()},#{row.exclusion_id}\r\n"
    , "")
    fs.writeFileAsync("#{__dirname}/humble_orb_codes_CSV.csv", codesOrbsCSV)

    return knex.transaction (tx)->
      return Promise.map(orbCodeRows, (row)=>
        return tx("gift_codes").insert(row).then ()-> bar.tick()
      , {concurrency:5}).then ()->
    .then ()->
      codesOrbsString = _.reduce codesOrbs, ((memo, code)-> return memo + "#{code}\r\n"), ""
      fs.writeFileAsync("#{__dirname}/humble_orb_codes_CSV.csv", codesOrbsCSV)
    .catch DidNotConfirmError, (e)->
      console.log "aborting..."
      callback()
###
program
  .command 'gift_codes:info <code>'
  .description 'create a set of redeemable gift codes'
  .action (args,callback)->

    code = args.code

    console.log("looking for code #{code}")

    if !code
      return callback(new Error("Must provide a code"))

    return knex("gift_codes").first().where('code',code)
    .then (codeRow)->
      console.log prettyjson.render(codeRow)
      callback()

###
# When configuration is complete, start the command line program
# @public
###
onConfigurationComplete = ()->

  coloredEnv = config.get('env')
  switch coloredEnv
    when 'production'
      coloredEnv = coloredEnv.toUpperCase().red
    when 'staging'
      coloredEnv = coloredEnv.toUpperCase().yellow

  pgUrl = url.parse(config.get('postgres_connection_string'));
  console.log("================".blue)
  console.log("CONFIG: env: "+coloredEnv)
  console.log("CONFIG: firebase: "+url.parse(config.get('firebase')).host)
  console.log("CONFIG: postgres: "+pgUrl.host+pgUrl.pathname)
  console.log("CONFIG: redis: "+config.get('redis.host'))
  console.log("================".blue)

  # configure knex
  knex = require('knex')({
    client: 'postgres'
    connection: config.get('postgres_connection_string')
    debug: false #config.isDevelopment()
  })



  # start commander
  # program.parse(process.argv)

  program
    .delimiter('crm$')
    .show()

# console.log process.argv

# check if an environment is specified and make a user pick one if none is provided via NODE_ENV
unless process.env.NODE_ENV

  return fs.readdirAsync(__dirname+'/config')
  .bind {}
  .then (files)->

    files = _.filter files,(f)-> f.match(/secret$/)
    inputChoices = _.map files, (f)-> f

    @.environments = inputChoices

    inputChoices = _.union(["DEVELOPMENT".blue,"LOCAL".yellow,"STAGING".cyan,new inquirer.Separator(),"CANCEL".red,new inquirer.Separator()],inputChoices)

    return inquirerPromisifed.prompt [{
      name:'environment'
      message:"You did not provide an environment via NODE_ENV. Please select one below."
      type:"list"
      choices:inputChoices
    }]

  .then (answers)->

    allPromises = [
      Promise.resolve(answers.environment)
    ]

    if answers.environment.match(/secret$/)
      allPromises.push inquirerPromisifed.prompt [{
        name:'passkey'
        message:"Enter environment passkey:"
        type:"password"
      }]

    return Promise.all(allPromises)

  .spread (environment,passkeyInput)->

    passkey = passkeyInput?.passkey

    if environment == "CANCEL".red

      process.exit(0)

    else if environment == "LOCAL".yellow

      process.env.NODE_ENV = 'local'

      # temporarily override log while requiring configuration
      fn = console.log
      console.log = ()->
      config = require 'config/config'
      console.log = fn

      config.loadFile(path.join(__dirname, "../config/local.json"))
      onConfigurationComplete()

    else if environment == "STAGING".cyan

      process.env.NODE_ENV = 'staging'

      # temporarily override log while requiring configuration
      fn = console.log
      console.log = ()->
      config = require 'config/config'
      console.log = fn

      config.loadFile(path.join(__dirname, "../config/staging.json"))
      onConfigurationComplete()

    else if environment == "DEVELOPMENT".blue

      # temporarily override log while requiring configuration
      fn = console.log
      console.log = ()->
      config = require 'config/config'
      console.log = fn

      onConfigurationComplete()

    else if environment.match(/secret$/)

      # temporarily override log while requiring configuration
      fn = console.log
      console.log = ()->
      config = require 'config/config'
      console.log = fn

      encryptor.decryptFileToDataAsync("#{__dirname}/config/#{environment}", passkey)
      .bind {}
      .then (data)->
        # load config file
        config.load(JSON.parse(data))
        onConfigurationComplete()
      .catch (e)->
        console.log prettyError.render(e)
        process.exit(1)

    else

      console.log("unknown environment... exiting")
      process.exit(1)

else

  config = require 'config/config'
  onConfigurationComplete()

process.on('uncaughtException', (err) ->
  console.log('Caught exception: ' + err);
)
