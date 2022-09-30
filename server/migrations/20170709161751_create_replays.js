exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_replays', (table) => {
      table.string('user_id', 36).notNullable();
      table.string('game_id', 36).notNullable();
      table.string('replay_id', 36).notNullable().index();
      table.string('version', 36).notNullable();
      table.dateTime('created_at').defaultTo(knex.fn.now());
      table.primary(['user_id', 'game_id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_replays'),
  ]);
};
