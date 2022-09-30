exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('games', (table) => {
      table.integer('player_1_general_id');
      table.integer('player_2_general_id');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('games', (table) => {
      table.dropColumn('player_1_general_id');
      table.dropColumn('player_2_general_id');
    }),
  ]);
};
