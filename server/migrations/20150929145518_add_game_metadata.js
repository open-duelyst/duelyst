exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('games', (table) => {
      table.integer('duration');
      table.boolean('is_conceded');
      table.specificType('player_1_deck', 'integer[]');
      table.specificType('player_2_deck', 'integer[]');
      table.integer('player_1_health');
      table.integer('player_2_health');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('games', (table) => {
      table.dropColumn('duration');
      table.dropColumn('is_conceded');
      table.dropColumn('player_1_deck');
      table.dropColumn('player_2_deck');
      table.dropColumn('player_1_health');
      table.dropColumn('player_2_health');
    }),
  ]);
};
