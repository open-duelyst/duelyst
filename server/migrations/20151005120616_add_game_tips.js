exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.integer('total_gold_tips_given').notNullable().defaultTo(knex.raw('0'));
    }),
    knex.schema.table('games', (table) => {
      table.integer('gold_tip_amount');
    }),
    knex.schema.table('user_games', (table) => {
      table.integer('gold_tip_amount');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('total_gold_tips_given');
    }),
    knex.schema.table('games', (table) => {
      table.dropColumn('gold_tip_amount');
    }),
    knex.schema.table('user_games', (table) => {
      table.dropColumn('gold_tip_amount');
    }),
  ]);
};
