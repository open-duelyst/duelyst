exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.string('registration_source');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('registration_source');
  });
};
