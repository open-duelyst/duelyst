exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.boolean('is_suspended').notNullable().defaultTo(false);
      table.dateTime('suspended_at');
      table.string('suspended_memo');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('is_suspended');
      table.dropColumn('suspended_at');
      table.dropColumn('suspended_memo');
    }),
  ]);
};
