exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.specificType('gift_chests', 'varchar[]');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('user_rewards', (table) => {
      table.dropColumn('gift_chests');
    }),
  ]);
};
