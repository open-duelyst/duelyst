exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('referral_code');
    }),
    knex.schema.createTable('referral_codes', (table) => {
      table.string('code', 36).notNullable().primary();
      table.string('type', 10);
      table.string('user_id', 36);
      table.string('owner_email', 36);
      table.integer('signup_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('signup_limit');
      table.json('params', true);
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('expires_at');
      table.boolean('is_active').notNullable().defaultTo(true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('referral_code');
    }),
    knex.schema.dropTableIfExists('referral_codes'),
  ]);
};
