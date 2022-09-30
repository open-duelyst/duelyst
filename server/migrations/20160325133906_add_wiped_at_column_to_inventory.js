exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_spirit_orbs_opened', (table) => {
      table.dateTime('wiped_at');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_spirit_orbs_opened', (table) => {
      table.dropColumn('wiped_at');
    }),
  ]);
};
