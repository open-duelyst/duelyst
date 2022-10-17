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
encryptor = require './lib/crypt.js'
PaypalTools = require('./lib/paypal-tools')
fs = require 'fs'
url = require 'url'
Promise.promisifyAll(fs)
Promise.promisifyAll(encryptor)

# firebase
DuelystFirebase = require 'server/lib/duelyst_firebase_module'
FirebasePromises = require 'server/lib/firebase_promises'

# data access modules
InventoryModule = null
UsersModule = null
SyncModule = null

# setup globals
knex = null

# configure pretty error
prettyError = new PrettyError()
prettyError.skipNodeFiles()
prettyError.skipPackage('bluebird')

# configure bluebird long stack support
process.env.BLUEBIRD_DEBUG = 1

# configure logger
Logger.enabled = false

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
    super(message)

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
        v = moment(v).format("YYYY-MM-DD")
      return v || ""
    t.push values

  console.log(t.toString())

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

program
  .command 'analytics:print_acceptance_data [month] [day] [year]'
  .description 'Prints a set of data used for validating analytics'
  .action (args,callback)->
    day = args.day || 10
    month = args.month || 11
    year = args.year || 2015
    startOfRange = moment(0).utc().date(day).month(month - 1).year(year)
    endOfRange = new moment(startOfRange).add(1,'day')

    # Daily revenue data
    sumRevenuePromise = knex("user_charges")
    .where('created_at','>',startOfRange.toDate()).andWhere('created_at','<',endOfRange.toDate()).sum("amount").then (chargeSumData) ->
      revenueSum = chargeSumData[0].sum || 0
      return Promise.resolve(revenueSum)

    # Daily new users data
    newUsersCountPromise = knex("users").where('created_at','>',startOfRange.toDate()).andWhere('created_at','<',endOfRange.toDate()).count().then (registeredUsersData)->
      count = registeredUsersData && registeredUsersData[0] && registeredUsersData[0].count || 0
      return Promise.resolve(count)

    # May be better to use ended_at
    # Games played
    gamesPlayedPromise = knex("games").where('created_at','>',startOfRange.toDate()).andWhere('created_at','<',endOfRange.toDate()).count().then (gameCountData)->
      count = gameCountData && gameCountData[0] && gameCountData[0].count || 0
      return Promise.resolve(count)

    Promise.all([sumRevenuePromise,newUsersCountPromise,gamesPlayedPromise])
    .spread (sumRevenue, newUsersCount, gamesPlayed) ->
      console.log("Analytics data for date " + startOfRange.format("LL"))
      console.log("Sum revenue: " + sumRevenue)
      console.log("New users count: " + newUsersCount)
      console.log("Games Played: " + gamesPlayed)
      callback()

    .catch (e)->
      console.log prettyError.render(e)
      callback(e)



###*
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

      config.loadFile(path.join(__dirname, "config/local.json"))
      onConfigurationComplete()

    else if environment == "STAGING".cyan

      process.env.NODE_ENV = 'staging'

      # temporarily override log while requiring configuration
      fn = console.log
      console.log = ()->
      config = require 'config/config'
      console.log = fn

      config.loadFile(path.join(__dirname, "config/staging.json"))
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
