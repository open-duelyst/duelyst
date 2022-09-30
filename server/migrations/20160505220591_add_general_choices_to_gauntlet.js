exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_gauntlet_run', (table) => {
      table.specificType('general_choices', 'integer[]');
    }),
    knex.schema.table('user_gauntlet_run_complete', (table) => {
      table.specificType('general_choices', 'integer[]');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_gauntlet_run', (table) => {
      table.dropColumn('general_choices');
    }),
    knex.schema.table('user_gauntlet_run_complete', (table) => {
      table.dropColumn('general_choices');
    }),
  ]);
};
