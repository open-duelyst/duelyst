exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('gift_codes', (table) => {
      table.string('code', 36).notNullable().primary();
      table.string('claimed_by_user_id');
      table.string('type', 36).notNullable();
      table.json('rewards', true);
      table.dateTime('claimed_at');
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('gift_codes'),
  ]);
};
