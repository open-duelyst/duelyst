exports.up = function (knex) {
  return knex.raw('CREATE INDEX CONCURRENTLY created_at ON games (created_at);');
};

exports.down = function (knex) {
  knex.schema.table('games', (table) => {
    table.dropIndex('created_at');
  });
};

exports.config = {
  transaction: false,
};
