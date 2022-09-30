exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.integer('unlocked_faction_id');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.dropColumn('unlocked_faction_id');
    }),
  ]);
};
