exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('user_decks', (table) => {
      table.integer('card_back_id');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('user_decks', (table) => {
      table.dropColumn('card_back_id');
    }),
  ]);
};
