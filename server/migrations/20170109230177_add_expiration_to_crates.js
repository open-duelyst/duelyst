exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_cosmetic_chests', (table) => {
      table.dateTime('expires_at');
    }),
    knex.schema.table('user_cosmetic_chests_opened', (table) => {
      table.dateTime('expires_at');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_cosmetic_chests', (table) => {
      table.dropColumn('expires_at');
    }),
    knex.schema.table('user_cosmetic_chests_opened', (table) => {
      table.dropColumn('expires_at');
    }),
  ]);
};
