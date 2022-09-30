//

exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('user_rank_ratings', (table) => {
      table.integer('ladder_rating').index();
      table.integer('srank_game_count').notNullable().defaultTo(0);
      table.integer('srank_win_count').notNullable().defaultTo(0);
    }),
    knex.schema.table('user_rank_history', (table) => {
      table.integer('ladder_rating');
      table.integer('srank_game_count');
      table.integer('srank_win_count');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('user_rank_ratings', (table) => {
      table.dropColumn('ladder_rating');
      table.dropColumn('srank_game_count');
      table.dropColumn('srank_win_count');
    }),
    knex.schema.table('user_rank_history', (table) => {
      table.dropColumn('ladder_rating');
      table.dropColumn('srank_game_count');
      table.dropColumn('srank_win_count');
    }),
  ]);
};
