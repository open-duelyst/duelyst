exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('kongregate_id');
      table.dateTime('kongregate_id_associated_at');
    }),
    knex.schema.raw('ALTER TABLE users ADD CONSTRAINT kongregate_index UNIQUE(kongregate_id)'),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('kongregate_id');
      table.dropColumn('kongregate_associated_at');
    }),
    knex.schema.raw('ALTER TABLE users DROP CONSTRAINT kongregate_index'),
  ]);
};
