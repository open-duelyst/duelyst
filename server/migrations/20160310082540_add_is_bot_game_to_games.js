exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_games', (table) => {
      table.boolean('is_bot_game');
    }),
    knex.schema.table('games', (table) => {
      table.boolean('is_bot_game');
    }),
    knex.schema.table('users', (table) => {
      table.boolean('is_bot');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_games', (table) => {
      table.dropColumn('is_bot_game');
    }),
    knex.schema.table('games', (table) => {
      table.dropColumn('is_bot_game');
    }),
    knex.schema.table('users', (table) => {
      table.dropColumn('is_bot');
    }),
  ]);
};
