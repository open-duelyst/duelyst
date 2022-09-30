exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.integer('battle_map_id');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('battle_map_id');
    }),
  ]);
};
