exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('kongregate_id_associated_at');
      table.dateTime('kongregate_associated_at');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('kongregate_associated_at');
    }),
  ]);
};
