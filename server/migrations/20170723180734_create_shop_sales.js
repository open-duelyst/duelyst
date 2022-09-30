exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('shop_sales', (table) => {
      table.string('sale_id', 36).primary().notNullable();
      table.string('sku', 255).index().notNullable(); // Only an index, which could be removed, leaving it open to keeping a backlog of sales we've done
      table.integer('sale_price').notNullable();
      table.dateTime('sale_starts_at').notNullable();
      table.dateTime('sale_ends_at').notNullable();
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('disabled').notNullable().defaultTo(false);
    }),
    knex.schema.table('user_currency_log', (table) => {
      table.string('sale_id', 36);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('shop_sales'),
    knex.schema.table('user_currency_log', (table) => {
      table.dropColumn('sale_id');
    }),
  ]);
};
