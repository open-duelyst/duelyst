exports.up = function (knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('bnea_id');
    table.dateTime('bnea_associated_at');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('bnea_id');
    table.dropColumn('bnea_associated_at');
  });
};
