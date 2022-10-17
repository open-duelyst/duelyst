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

console.log "loading gauntlet runs..."
knex("user_gauntlet_run").select('user_id','deck','is_resigned','created_at').whereNotNull('deck')
.then (gauntletRuns)->

  console.log "loaded #{gauntletRuns.length} gauntlet runs"
  # bar = new ProgressBar('processing [:bar] :percent :etas', {
  #   complete: '=',
  #   incomplete: ' ',
  #   width: 20,
  #   total: parseInt(gauntletRuns.length)
  # })

  gauntletRuns = _.filter gauntletRuns, (run)->
    return _.find run.deck, (cardId)-> parseInt(cardId) == SDK.Cards.Neutral.BloodTaura

  console.log "#{gauntletRuns.length} gauntlet runs have TAURA"

  return Promise.map gauntletRuns, (gauntletRun)->
    # bar.tick()
    hasTaura = _.find gauntletRun.deck, (cardId)-> parseInt(cardId) == SDK.Cards.Neutral.BloodTaura
    if hasTaura
      console.log "HAS TAURA! #{gauntletRun.user_id} started on #{gauntletRun.created_at}"
      if not gauntletRun.is_resigned
        console.log "resigning run for #{gauntletRun.user_id}"
        return GauntletModule.resignRun(gauntletRun.user_id).then ()->
          console.log "Resigned. Adding gauntlet ticket to #{gauntletRun.user_id}"
          return knex.transaction (tx)-> GauntletModule.addArenaTicketToUser(Promise.resolve(),tx,gauntletRun.user_id,"crm")
    else
      return Promise.resolve()
  ,{concurrency: 1}
.then ()->
  console.log "done"
  # process.exit(0)
.catch (e)->
  console.log "ERROR! #{e.message}"
  console.log prettyError.render(e)
  throw e
  process.exit(1)