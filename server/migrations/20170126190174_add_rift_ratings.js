exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_rift_runs', (table) => {
      table.integer('rift_rating'); // TODO: should this be keyed? // Allowing this to be nullable so default can be code configured in data_access/rift.coffee
    }),
    knex.schema.table('user_games', (table) => {
      table.integer('rift_rating_after');
      table.integer('rift_rating_earned');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_rift_runs', (table) => {
      table.dropColumn('rift_rating');
    }),
    knex.schema.table('user_games', (table) => {
      table.dropColumn('rift_rating_after');
      table.dropColumn('rift_rating_earned');
    }),
  ]);
};
