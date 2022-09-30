exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_progression', (table) => {
      table.integer('last_crate_awarded_game_count');
      table.integer('last_crate_awarded_win_count');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_progression', (table) => {
      table.dropColumn('last_crate_awarded_game_count');
      table.dropColumn('last_crate_awarded_win_count');
    }),
  ]);
};
