exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_faction_progression', (table) => {
      table.integer('single_player_win_count').notNullable().defaultTo(0);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_faction_progression', (table) => {
      table.dropColumn('single_player_win_count');
    }),
  ]);
};
