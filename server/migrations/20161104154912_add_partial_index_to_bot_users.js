exports.up = function (knex) {
  return Promise.all([
    knex.raw('CREATE INDEX CONCURRENTLY users_is_bot_index ON users (is_bot) WHERE is_bot = true'),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropIndex('is_bot'); // will use default index name users_is_bot_index
    }),
  ]);
};

exports.config = {
  transaction: false,
};
