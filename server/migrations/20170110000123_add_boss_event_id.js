exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_cosmetic_chests', (table) => {
      table.string('boss_event_id');
    }),
    knex.schema.table('user_cosmetic_chests_opened', (table) => {
      table.string('boss_event_id');
    }),
    knex.schema.table('user_bosses_defeated', (table) => {
      table.string('boss_event_id').notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_cosmetic_chests', (table) => {
      table.dropColumn('boss_event_id');
    }),
    knex.schema.table('user_cosmetic_chests_opened', (table) => {
      table.dropColumn('boss_event_id');
    }),
    knex.schema.table('user_bosses_defeated', (table) => {
      table.dropColumn('boss_event_id');
    }),
  ]);
};
