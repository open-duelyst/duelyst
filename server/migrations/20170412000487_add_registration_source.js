exports.up = function (knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('registration_source');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('registration_source');
  });
};
