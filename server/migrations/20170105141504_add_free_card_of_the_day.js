exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dateTime('free_card_of_the_day_claimed_at');
      table.integer('free_card_of_the_day_claimed_count').defaultTo(0).notNullable();
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('free_card_of_the_day_claimed_at');
      table.dropColumn('free_card_of_the_day_claimed_count');
    }),
  ]);
};
