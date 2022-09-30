exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.integer('total_orb_count_set_3').defaultTo(0).notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('total_orb_count_set_3');
    }),
  ]);
};
