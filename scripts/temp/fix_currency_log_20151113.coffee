knex = require "../../server/lib/data_access/knex"
generatePushId = require "../../app/common/generate_push_id"
Promise = require "bluebird"
PrettyError = require 'pretty-error'

# configure pretty error
prettyError = new PrettyError()
prettyError.skipNodeFiles()
prettyError.skipPackage('bluebird')

knex.transaction (tx)->
  tx("user_spirit_orbs")
    .where('created_at','>','2015-10-02 03:04:12.53+00')
    .andWhere('created_at','<','2015-11-19 23:56:19.086+00') #TODO: put deployment date in here
    .andWhere('transaction_type','soft')
    .select('id','user_id','created_at')
  .then (orbRows)->
    allPromises = []
    for row in orbRows
      allPromises.push tx("user_currency_log").insert({
        id: generatePushId()
        user_id: row.user_id
        created_at: row.created_at
        gold: -100
        memo: "spirit orb #{row.id}"
      })
    return Promise.all(allPromises)
  .then tx.commit
  .catch tx.rollback
.then ()->
  console.log "done"
  process.exit(0)
.catch (e)->
  console.log "ERROR! #{e.message}"
  console.log prettyError.render(e)
  throw e
  process.exit(1)
