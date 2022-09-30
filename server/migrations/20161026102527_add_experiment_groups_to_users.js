exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.specificType('experiment_groups', 'varchar[]');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('experiment_groups');
    }),
  ]);
};
