exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('gift_codes', (table) => {
      table.dateTime('valid_for_users_created_after');
      table.dateTime('expires_at');
      table.integer('game_count_limit');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('gift_codes', (table) => {
      table.dropColumn('valid_for_users_created_after');
      table.dropColumn('expires_at');
      table.dropColumn('game_count_limit');
    }),
  ]);
};
