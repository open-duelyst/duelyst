# libraries
path = require('path')
require('app-module-path').addPath(path.join(__dirname, '..'))
program = require 'commander'
Promise = require 'bluebird'
ProgressBar = require 'progress'
config = require 'config/config'
inquirerPromisifed = require 'bluebird-inquirer'
inquirer = require 'inquirer'
colors = require 'colors'
uuid = require 'node-uuid'
PrettyError = require 'pretty-error'
prettyjson = require 'prettyjson'
Logger = require 'app/common/logger'
validator = require 'validator'
_ = require 'underscore'
encryptor = require './lib/crypt'
fs = require 'fs'
url = require 'url'
Promise.promisifyAll(fs)
Promise.promisifyAll(encryptor)

# setup globals
env = config.get('env').toUpperCase()

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
        message:"<#{env}> #{msg} continue? Y/N?"
      }],(answers)->
        if answers.confirm.toLowerCase() == "y"
          resolve()
        else
          reject(new DidNotConfirmError())
    else
      resolve()

program
  .version('0.0.1')
  .option('-d, --debug', 'Enable verbose debug logging')
  .option('-n, --noprompt', 'Enable/disable confirmation prompts')

program
  .command 'generate <filename>'
  .description 'generate a secure environment file'
  .action (filename)->
    return Promise.resolve()
    .bind {}
    .then ()->

      return inquirerPromisifed.prompt [{
        name:'passkey'
        message:"Enter passkey for #{filename}:"
        type:"password"
      }]

    .then (answers)->

      if not validator.isLength(answers.passkey,6)
        throw new Error("passkey must be at least 6 chars long")

      return Promise.all [
        fs.readFileAsync("#{__dirname}/config/#{filename}")
        answers
      ]

    .spread (data,answers)->

      return encryptor.encryptDataToFileAsync(data, "#{__dirname}/config/#{filename}.secret", answers.passkey)

    .then ()->

      console.log ("ALL DONE".green)
      process.exit(0)

    .catch (e)->

      console.log prettyError.render(e)
      process.exit(1)

program
  .command 'update_passkey <filename>'
  .description 'generate a secure environment file'
  .action (filename)->
    return Promise.resolve()
    .bind {}
    .then ()->

      return inquirerPromisifed.prompt [{
        name:'passkey'
        message:"Enter #{"CURRENT".yellow} passkey for #{filename}:"
        type:"password"
      }]

    .then (answers)->

      return encryptor.decryptFileToDataAsync("#{__dirname}/config/#{filename}.secret", answers.passkey)

    .then (data)->

      console.log data

      @.data = data

      return inquirerPromisifed.prompt [{
        name:'passkey'
        message:"Enter #{"NEW".green} passkey for #{filename}:"
        type:"password"
      }]

    .then (answers)->

      if not validator.isLength(answers.passkey,6)
        throw new Error("passkey must be at least 6 chars long")

      return encryptor.encryptDataToFileAsync(@.data, "#{__dirname}/config/#{filename}.secret", answers.passkey)

    .then ()->

      console.log ("ALL DONE".green)
      process.exit(0)

    .catch (e)->

      console.log ("ERROR".red)
      console.log prettyError.render(e)
      process.exit(1)

program
  .command 'print <filename> [pretty]'
  .description 'print configuration details'
  .action (filename,pretty)->
    return Promise.resolve()
    .bind {}
    .then ()->

      return inquirerPromisifed.prompt [{
        name:'passkey'
        message:"Enter #{"CURRENT".yellow} passkey for #{filename}:"
        type:"password"
      }]

    .then (answers)->

      return encryptor.decryptFileToDataAsync("#{__dirname}/config/#{filename}.secret", answers.passkey)

    .then (data)->

      if pretty
        console.log prettyjson.render(JSON.parse(data))
      else
        console.log data

      process.exit(0)

# start commander
program.parse(process.argv)
