exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('games', (table) => {
      table.integer('player_1_rank');
      table.integer('player_2_rank');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('games', (table) => {
      table.dropColumn('player_1_rank');
      table.dropColumn('player_2_rank');
    }),
  ]);
};
