exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dateTime('last_retention_gift_at');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('last_retention_gift_at');
  });
};
