exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.renameColumn('emotes', 'cosmetics');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.renameColumn('cosmetics', 'emotes');
    }),
  ]);
};
