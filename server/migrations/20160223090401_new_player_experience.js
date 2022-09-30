exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_quests', (table) => {
      table.integer('spirit_orbs');
      table.boolean('is_replaceable').notNullable().defaultTo(true);
    }),
    knex.schema.table('user_quests_complete', (table) => {
      table.integer('spirit_orbs');
      table.boolean('is_replaceable').notNullable().defaultTo(true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_quests', (table) => {
      table.dropColumn('spirit_orbs');
      table.dropColumn('is_replaceable');
    }),
    knex.schema.table('user_quests_complete', (table) => {
      table.dropColumn('spirit_orbs');
      table.dropColumn('is_replaceable');
    }),
  ]);
};
