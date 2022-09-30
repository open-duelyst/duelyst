exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.integer('wallet_premium').notNullable().defaultTo(knex.raw('0'));
    table.integer('total_premium_earned').notNullable().defaultTo(knex.raw('0'));
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('wallet_premium');
    table.dropColumn('total_premium_earned');
  });
};
