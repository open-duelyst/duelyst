exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_twitch_rewards', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('twitch_reward_id').notNullable();
      table.specificType('reward_ids', 'varchar[]');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('claimed_at');
      table.string('description');
      table.primary(['user_id', 'twitch_reward_id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_twitch_rewards'),
  ]);
};
