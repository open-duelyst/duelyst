exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_gauntlet_run', (table) => {
      table.integer('general_id');
    }),
    knex.schema.table('user_gauntlet_run_complete', (table) => {
      table.integer('general_id');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_gauntlet_run', (table) => {
      table.dropColumn('general_id');
    }),
    knex.schema.table('user_gauntlet_run_complete', (table) => {
      table.dropColumn('general_id');
    }),
  ]);
};
