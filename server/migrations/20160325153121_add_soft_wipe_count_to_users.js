exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.integer('soft_wipe_count');
    table.dateTime('last_soft_twipe_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('soft_wipe_count');
    table.dropColumn('last_soft_twipe_at');
  });
};
