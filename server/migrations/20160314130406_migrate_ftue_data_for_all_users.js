require('coffeescript/register');
const NewPlayerProgressionStageEnum = require('../../app/sdk/progression/newPlayerProgressionStageEnum.coffee');
const NewPlayerProgressionHelper = require('../../app/sdk/progression/newPlayerProgressionHelper.coffee');

exports.up = function (knex) {
  return Promise.all([
    knex.raw('UPDATE users SET tx_count = 0 WHERE id NOT IN (SELECT user_id FROM user_new_player_progression WHERE module_name=\'core\' AND stage=\'has_played_a_match\')'),
    knex.raw('DELETE FROM user_quests WHERE user_id NOT IN (SELECT user_id FROM user_new_player_progression WHERE module_name=\'core\' AND stage=\'has_played_a_match\')'),
    knex.raw('DELETE FROM user_new_player_progression WHERE NOT module_name = \'core\''),
    knex.raw('INSERT INTO user_new_player_progression (user_id,module_name,stage) (SELECT user_id, \'quest\' as module_name, \'unread\' as stage FROM user_new_player_progression WHERE module_name=\'core\' AND stage=\'done_with_tutorials\')'),
  ]).then(() => Promise.all([
    knex('user_new_player_progression')
      .where('module_name', 'core')
      .andWhere('stage', 'done_with_tutorials')
      .update({ stage: NewPlayerProgressionStageEnum.TutorialDone.key }),
    knex('user_new_player_progression')
      .where('module_name', 'core')
      .andWhere('stage', 'has_played_a_match')
      .update({ stage: NewPlayerProgressionHelper.FinalStage.key }),
  ]));
};

exports.down = function (knex) {

};
