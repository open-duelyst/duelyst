Promise = require "bluebird"
PrettyError = require 'pretty-error'
ProgressBar = require 'progress'
_ = require 'underscore'

path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../'))
SDK = require 'app/sdk'
knex = require "server/lib/data_access/knex"
GauntletModule = require "server/lib/data_access/gauntlet"
InventoryModule = require "server/lib/data_access/inventory"
UsersModule = require "server/lib/data_access/users"

# configure pretty error
prettyError = new PrettyError()
prettyError.skipNodeFiles()
prettyError.skipPackage('bluebird')

p = knex.transaction (tx)->
  Promise.resolve(tx("users").first().forUpdate())
  .then (userRow)->
    return tx("user_progression").first()
  .delay(1000)
  .then (progression)->
    return tx("user_faction_progression").first()
  .then (progression)-> console.log("after delay")
  .timeout(500)
  .catch (e)->
    console.log("EXCEPTION: #{e.message}")
    throw e
  .finally ()->
    console.log("FINALLY")
    return Promise.resolve(true)
.then ()->
  console.log("ALL DONE")
.catch (e)->
  console.log("ERROR: #{e.message}")
.finally ()->
  console.log knex.client?.pool?.stats()

p.then ()->
  console.log("exiting...")
  process.exit(0)
