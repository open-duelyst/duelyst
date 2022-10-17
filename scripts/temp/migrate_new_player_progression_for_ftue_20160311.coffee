knex = require "../../server/lib/data_access/knex"
generatePushId = require "../../app/common/generate_push_id"
Promise = require "bluebird"
PrettyError = require 'pretty-error'
NewPlayerProgressionStageEnum = require '../../app/sdk/progression/newPlayerProgressionStageEnum'
NewPlayerProgressionHelper = require '../../app/sdk/progression/newPlayerProgressionHelper'

# configure pretty error
prettyError = new PrettyError()
prettyError.skipNodeFiles()
prettyError.skipPackage('bluebird')

knex.transaction (tx)->
  return Promise.all([
    tx.raw("DELETE FROM user_quests WHERE user_id NOT IN (SELECT user_id FROM user_new_player_progression WHERE module_name='core' AND stage='has_played_a_match')"),
    tx.raw("DELETE FROM user_new_player_progression WHERE NOT module_name = 'core'"),
    tx.raw("INSERT INTO user_new_player_progression (user_id,module_name,stage) (SELECT user_id, 'quest' as module_name, 'unread' as stage FROM user_new_player_progression WHERE module_name='core' AND stage='done_with_tutorials')")
    tx.raw("UPDATE users SET tx_count = 0 WHERE id NOT IN (SELECT user_id FROM user_new_player_progression WHERE module_name='core' AND stage='has_played_a_match')"),
  ]).then ()->
    return Promise.all([
      tx("user_new_player_progression")
        .where('module_name','core')
        .andWhere('stage','done_with_tutorials')
        .update({ stage: NewPlayerProgressionStageEnum.TutorialDone.key }),
      tx("user_new_player_progression")
        .where('module_name','core')
        .andWhere('stage','has_played_a_match')
        .update({ stage: NewPlayerProgressionHelper.FinalStage.key })
    ])
.then ()->
  console.log "done"
  process.exit(0)
.catch (e)->
  console.log "ERROR! #{e.message}"
  console.log prettyError.render(e)
  process.exit(1)
