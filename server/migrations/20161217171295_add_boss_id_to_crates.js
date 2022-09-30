exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_cosmetic_chests', (table) => {
      table.integer('boss_id');
    }),
    knex.schema.table('user_cosmetic_chests_opened', (table) => {
      table.integer('boss_id');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_cosmetic_chests', (table) => {
      table.dropColumn('boss_id');
    }),
    knex.schema.table('user_cosmetic_chests_opened', (table) => {
      table.dropColumn('boss_id');
    }),
  ]);
};
