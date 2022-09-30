exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_currency_log', (table) => {
      table.integer('premium_currency');
      table.string('sku', 255);
    }).then(() => knex.raw('CREATE INDEX CONCURRENTLY sku_index ON user_currency_log (sku) WHERE sku IS NOT NULL')),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_currency_log', (table) => {
      table.dropColumn('premium_currency');
      table.dropColumn('sku');
    }),
  ]);
};

exports.config = {
  transaction: false,
};
