exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('user_game_general_counters', (table) => {
      table.string('user_id', 36).notNullable().index();
      table.string('game_type').notNullable();
      table.integer('general_id').notNullable();
      table.integer('game_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('draw_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('unscored_count').notNullable().defaultTo(knex.raw('0'));
      table.integer('win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_win_streak').notNullable().defaultTo(knex.raw('0'));
      table.integer('top_loss_streak').notNullable().defaultTo(knex.raw('0'));
      table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
      table.dateTime('updated_at');
      table.primary(['user_id', 'game_type', 'general_id']);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('user_game_general_counters'),
  ]);
};
