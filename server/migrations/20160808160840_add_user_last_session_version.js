exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('last_session_version');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('last_session_version');
    }),
  ]);
};
