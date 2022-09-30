exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_progression', (table) => {
      table.string('last_opponent_id', 36);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_progression', (table) => {
      table.dropColumn('last_opponent_id');
    }),
  ]);
};
