exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('did_purchase_within_7_days');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.boolean('did_purchase_within_7_days');
  });
};
