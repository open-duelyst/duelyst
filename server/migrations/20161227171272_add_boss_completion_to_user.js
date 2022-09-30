exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_bosses_defeated', (table) => {
      table.string('user_id', 36).notNullable();
      table.integer('boss_id').notNullable();
      table.string('game_id').notNullable();
      table.dateTime('defeated_at');
      table.primary(['user_id', 'boss_id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_bosses_defeated'),
  ]);
};
